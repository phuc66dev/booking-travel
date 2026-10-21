import { useCallback, useRef, useState, type FormEvent } from "react";
import { useCreateBooking } from "../api/booking-mutations.ts";
import { PriceChangedError } from "../api/booking-service.ts";
import { contactErrors, normalizePhone } from "../domain/validation.ts";
import { voucherError } from "../domain/pricing.ts";
import { useBookingSelection } from "./use-booking-selection.ts";
import { useContactSession } from "./contact-context.ts";
import { demoId } from "../../id.ts";
import { navigateTo } from "../../../app/router.ts";
import type { Contact } from "../types.ts";

export function useCheckout() {
  const selection = useBookingSelection();
  const { draft, q, update } = selection;
  const { contact, setContact, agree, setAgree } = useContactSession();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [voucherFeedback, setVoucherFeedback] = useState("");
  const [fixture, setFixture] = useState("normal");
  const [priceReview, setPriceReview] = useState<PriceChangedError | null>(
    null,
  );
  const [acceptedVersion, setAcceptedVersion] = useState<string>();
  const [acceptingPrice, setAcceptingPrice] = useState(false);
  const [idempotencyKey] = useState(demoId);
  const inFlight = useRef(false);
  const mutation = useCreateBooking();
  const refetchQuote = selection.quoteQuery.refetch;
  const onContactChange = useCallback(
    (field: keyof Contact, value: string) => {
      setContact((previous) => ({ ...previous, [field]: value }));
    },
    [setContact],
  );
  const onContactBlur = useCallback(
    (field: keyof Contact) => {
      setErrors((previous) => ({
        ...previous,
        [field]: contactErrors(contact, agree)[field] || "",
      }));
    },
    [contact, agree],
  );
  const applyVoucher = useCallback(
    (value: string) => {
      const code = value.trim().toUpperCase();
      const error = voucherError(code, q.passengerSubtotal);
      setVoucherFeedback(error || "Đã cập nhật mã ưu đãi.");
      if (!error) update({ voucherCode: code });
    },
    [q.passengerSubtotal, update],
  );
  const acceptPrice = useCallback(async () => {
    if (!priceReview || inFlight.current) return;
    inFlight.current = true;
    setAcceptingPrice(true);
    try {
      // The selection may have changed since the failed submission. Let the
      // query observer revalidate/cache its CURRENT key instead of copying the
      // old selection's quote into a different key.
      const result = await refetchQuote();
      if (result.isError) throw result.error;
      if (!result.data)
        throw new Error("Chưa lấy được báo giá. Vui lòng thử lại.");
      if (result.data.quoteVersion !== priceReview.newQuote.quoteVersion) {
        setPriceReview(
          new PriceChangedError(priceReview.newQuote, result.data),
        );
        setNotice(
          "Giá tiếp tục thay đổi. Vui lòng kiểm tra và chấp nhận báo giá mới.",
        );
        return;
      }
      setAcceptedVersion(result.data.quoteVersion);
      setPriceReview(null);
      setFixture("normal");
      setNotice(
        "Đã chấp nhận báo giá mới. Kiểm tra đơn và bấm tạo yêu cầu để tiếp tục.",
      );
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      inFlight.current = false;
      setAcceptingPrice(false);
    }
  }, [priceReview, refetchQuote]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = contactErrors(contact, agree);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors).find(
      (field) => nextErrors[field as keyof typeof nextErrors],
    );
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    if (inFlight.current || priceReview || selection.reason) return;
    inFlight.current = true;
    setNotice("");
    try {
      const booking = await mutation.mutateAsync({
        draft,
        contact: {
          ...contact,
          name: contact.name.trim(),
          phone: normalizePhone(contact.phone),
        },
        idempotencyKey,
        fixture,
        acceptedQuoteVersion: acceptedVersion,
      });
      navigateTo("/booking/" + booking.id);
      window.scrollTo(0, 0);
    } catch (error) {
      setNotice((error as Error).message);
      if (error instanceof PriceChangedError) setPriceReview(error);
    } finally {
      inFlight.current = false;
    }
  }
  return {
    ...selection,
    contact,
    agree,
    setAgree,
    errors,
    notice: notice || selection.notice,
    voucherFeedback,
    fixture,
    setFixture,
    priceReview,
    busy: mutation.isPending || acceptingPrice,
    onContactChange,
    onContactBlur,
    applyVoucher,
    acceptPrice,
    submit,
  };
}
