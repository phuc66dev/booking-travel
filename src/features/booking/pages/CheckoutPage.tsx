import { tours } from "../../../data/mock-tours.ts";
import { useCheckout } from "../hooks/use-checkout.ts";
import { ContactForm } from "../components/ContactForm.tsx";
import {
  BookingSummary,
  BookingSummaryView,
} from "../components/BookingSummary.tsx";
import { AppLink } from "../../../shared/components/AppLink.tsx";
import { AsyncState } from "../../../shared/components/AsyncState.tsx";
import { money } from "../../../shared/lib/format.ts";

export default function CheckoutPage() {
  const checkout = useCheckout();
  const { draft, q, dep, price, reason, departuresQuery, quoteQuery, update } =
    checkout;
  const tour = tours.find((item) => item.id === draft.tourId)!;
  // Same view/props in both runs: only React.memo differs. Never enabled in production.
  const Summary =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("profile") === "baseline"
      ? BookingSummaryView
      : BookingSummary;
  if (departuresQuery.isPending || departuresQuery.isError)
    return (
      <AsyncState
        error={departuresQuery.error}
        retry={() => void departuresQuery.refetch()}
      />
    );
  return (
    <main className="container checkout">
      <div className="stepper">
        <span>✓ Chọn tour</span>
        <strong>02 Thông tin đặt tour</strong>
        <span>03 Kết quả</span>
      </div>
      <span className="demo">Bản demo · Không chuyển tiền</span>
      <h1>Sắp có thêm một chuyến đi đáng nhớ.</h1>
      <p>Kiểm tra lựa chọn và để lại thông tin liên hệ.</p>
      {reason ? (
        <div className="empty">
          <p>{reason}</p>
          <AppLink href={"/tours/" + tour.slug} className="cta">
            Quay lại chọn tour
          </AppLink>
        </div>
      ) : (
        <form className="checkout-grid" noValidate onSubmit={checkout.submit}>
          <div>
            <ContactForm
              contact={checkout.contact}
              errors={checkout.errors}
              onChange={checkout.onContactChange}
              onBlur={checkout.onContactBlur}
            />
            <section className="form-card">
              <h2>Thanh toán minh họa</h2>
              <fieldset className="payment-options" disabled={checkout.busy}>
                <legend className="sr-only">Tỷ lệ thanh toán demo</legend>
                {[100, 50].map((ratio) => (
                  <label
                    key={ratio}
                    className={draft.paymentRatio === ratio ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="payment-ratio"
                      value={ratio}
                      checked={draft.paymentRatio === ratio}
                      onChange={() => update({ paymentRatio: ratio })}
                    />
                    {ratio === 100 ? "Toàn bộ" : "Trả trước 50%"}
                    <strong>
                      {money(
                        ratio === 100 ? q.total : Math.ceil(q.total * 0.5),
                      )}
                    </strong>
                  </label>
                ))}
              </fieldset>
              <div className="hint">
                <strong>Chuyển khoản demo</strong>
                <p>
                  Không có tài khoản hay QR thật. Không chuyển tiền. Yêu cầu
                  không xác nhận thanh toán hoặc giữ chỗ.
                </p>
              </div>
              <label>
                Tình huống kiểm thử
                <select
                  value={checkout.fixture}
                  disabled={checkout.busy}
                  onChange={(event) => checkout.setFixture(event.target.value)}
                >
                  <option value="normal">Bình thường</option>
                  <option value="soldout">Chuyến vừa hết chỗ</option>
                  <option value="price">Giá thay đổi</option>
                  <option value="network">Lỗi kết nối</option>
                </select>
              </label>
            </section>
          </div>
          <Summary
            tour={tour}
            draft={draft}
            departure={dep}
            packageName={price.name}
            quote={q}
            agree={checkout.agree}
            agreeError={checkout.errors.agree}
            busy={checkout.busy}
            calculating={quoteQuery.isFetching}
            notice={checkout.notice || quoteQuery.error?.message || ""}
            voucherFeedback={checkout.voucherFeedback}
            priceReview={checkout.priceReview}
            onAgree={checkout.setAgree}
            onVoucher={checkout.applyVoucher}
            onUpdate={update}
            onAcceptPrice={checkout.acceptPrice}
          />
        </form>
      )}
    </main>
  );
}
