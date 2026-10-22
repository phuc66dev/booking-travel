import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const detailPath = "/tours/my-tho-ben-tre-can-tho";
const evidence = "docs/evidence";
mkdirSync(evidence, { recursive: true });
let pageErrors: string[] = [];

// Deterministic offline image/font failure also verifies the local image fallback.
test.beforeEach(async ({ page, context }) => {
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await context.route(
    /https:\/\/(images\.unsplash\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,
    (route) =>
      route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Demo test fixture: external media unavailable",
      }),
  );
});
test.afterEach(() => {
  expect(pageErrors, "No uncaught browser JavaScript errors").toEqual([]);
});

async function chooseTour(page: Page) {
  await page.goto(detailPath);
  await expect(page.locator("main.detail h1")).toBeVisible();
  const card = page.locator(".desktop-booking");
  await card.locator(".dates button").first().click();
  await card.locator("input[type=radio]").first().check();
  await expect(card.locator(".breakdown .total")).toContainText("3.200.000");
  await card.getByRole("button", { name: /Tiếp tục đặt tour/ }).click();
  await expect(page.locator("#name")).toBeVisible();
}

async function fillContact(page: Page) {
  await page.locator("#name").fill("Nguyễn Thị Lan");
  await page.locator("#phone").fill("0901234567");
  await page.locator("#agree").check();
}

test("home has one main landmark containing its H1 and no missing-key warnings", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (/Each child in a list|unique.*key/i.test(message.text()))
      warnings.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator(".destination-row a")).toHaveCount(4);
  expect(warnings).toEqual([]);
});

test("development UI panel demonstrates boundary isolation and Suspense fallback", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Kiểm thử UI" }).click();

  await page.getByRole("button", { name: "Gây lỗi kiểm thử" }).click();
  await expect(
    page.getByRole("alert").getByText("Lỗi đã được boundary cục bộ chặn"),
  ).toBeVisible();
  await expect(page.locator("header nav")).toBeVisible();
  await expect(page.locator("main h1")).toBeVisible();
  await page.getByRole("button", { name: "Khôi phục vùng kiểm thử" }).click();
  await expect(
    page.getByRole("button", { name: "Gây lỗi kiểm thử" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Boundary cục bộ: Có" }).click();
  await page.getByRole("button", { name: "Gây lỗi kiểm thử" }).click();
  await expect(
    page.getByRole("heading", { name: "Boundary của trang đã bắt lỗi" }),
  ).toBeVisible();
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Hẹn nhau ở miền Tây" })).toHaveCount(0);
  await expect(page.locator("header nav")).toBeVisible();
  await page.getByRole("button", { name: "Khôi phục trang" }).click();
  await expect(page.getByRole("heading", { name: "Hẹn nhau ở miền Tây" })).toBeVisible();
  await page.getByRole("button", { name: "Boundary cục bộ: Không" }).click();

  await page.getByRole("button", { name: "Mô phỏng tải chậm" }).click();
  await expect(
    page.getByText("Đang tải trong Suspense cục bộ…"),
  ).toBeVisible();
  await expect(
    page.getByRole("status").getByText("Suspense đã tải xong nội dung kiểm thử."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đặt lại kiểm thử tải chậm" }).click();
  await page.getByRole("button", { name: "Suspense cục bộ: Có" }).click();
  await page.getByRole("button", { name: "Mô phỏng tải chậm" }).click();
  await expect(
    page.getByText(
      "Đang tải ở Suspense bao ngoài (không có Suspense cục bộ)…",
    ),
  ).toBeVisible();
  await expect(page.locator("header nav")).toBeVisible();
  await expect(
    page.getByRole("status").getByText("Suspense đã tải xong nội dung kiểm thử."),
  ).toBeVisible();
  await expect(page.locator("main h1")).toBeVisible();
});

test("complete booking, voucher/deposit, lookup and correct unpaid status", async ({
  page,
}) => {
  await chooseTour(page);
  await fillContact(page);
  await page.getByLabel("Mã ưu đãi").fill(" mekong100 ");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await expect(page.locator(".summary .total")).toContainText("3.100.000");
  await page.locator('input[name=payment-ratio][value="50"]').check();
  await expect(page.locator(".pay-now")).toContainText("1.550.000");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(
    page.getByRole("heading", { name: "Đã nhận yêu cầu của bạn" }),
  ).toBeVisible();
  await expect(page.locator(".status-row")).toContainText("Chờ xác nhận");
  await expect(page.locator(".status-row")).toContainText("Chưa thanh toán");
  const code = (await page.locator(".form-card h2").textContent())!;
  await page
    .getByRole("link", { name: "Tra cứu yêu cầu", exact: true })
    .click();
  await page.getByLabel("Mã yêu cầu").fill(code);
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0911111111");
  await page.getByRole("button", { name: "Tra cứu yêu cầu" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Không tìm thấy đơn phù hợp",
  );
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0901234567");
  await page.getByRole("button", { name: "Tra cứu yêu cầu" }).click();
  await expect(
    page.getByRole("heading", { name: "Đã nhận yêu cầu của bạn" }),
  ).toBeVisible();
});

test("field validation focuses first error and contact survives editing tour", async ({
  page,
}) => {
  await chooseTour(page);
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(page.locator("#name")).toBeFocused();
  await expect(page.locator("#name-error")).not.toBeEmpty();
  await page.locator("#name").fill("Nguyễn Thị Lan");
  await page.getByRole("link", { name: "Sửa lựa chọn" }).click();
  await page
    .locator(".desktop-booking")
    .getByRole("button", { name: /Tiếp tục đặt tour/ })
    .click();
  await expect(page.locator("#name")).toHaveValue("Nguyễn Thị Lan");
  const saved = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("mj-draft") || "null"),
  );
  expect(saved).not.toHaveProperty("contact");
  expect(Object.keys(saved.draft).sort()).toEqual([
    "adults",
    "children",
    "departureId",
    "infants",
    "packageId",
    "paymentRatio",
    "tourId",
    "voucherCode",
  ]);
});

test("sold-out and network errors retain contact and allow recovery", async ({
  page,
}) => {
  await chooseTour(page);
  await fillContact(page);
  await page.getByLabel("Tình huống kiểm thử").selectOption("soldout");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(page.locator(".submit-feedback")).toContainText("hết chỗ");
  await expect(page.locator("#name")).toHaveValue("Nguyễn Thị Lan");
  await page.getByLabel("Tình huống kiểm thử").selectOption("network");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(page.locator(".submit-feedback")).toContainText("gián đoạn");
  await page.getByLabel("Tình huống kiểm thử").selectOption("normal");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(
    page.getByRole("heading", { name: "Đã nhận yêu cầu của bạn" }),
  ).toBeVisible();
});

test("price change requires explicit acceptance and an additional submit", async ({
  page,
}) => {
  await chooseTour(page);
  await fillContact(page);
  await page.getByLabel("Tình huống kiểm thử").selectOption("price");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(page.locator(".price-review")).toContainText("3.400.000");
  await expect(
    page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Chấp nhận báo giá mới" }).click();
  await expect(page.locator(".summary .total")).toContainText("3.400.000");
  await expect(page).toHaveURL(/\/booking$/);
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(
    page.getByRole("heading", { name: "Đã nhận yêu cầu của bạn" }),
  ).toBeVisible();
});

test("URL search, Back and reload preserve filters and canonical pagination", async ({
  page,
}) => {
  await page.goto("/tours?q=CAN+THO&page=99");
  await expect(page.locator(".results-head")).toContainText("2");
  await expect(page).toHaveURL(/q=CAN\+THO$/);
  await page.getByLabel("Sắp xếp").selectOption("desc");
  await expect(page).toHaveURL(/sort=desc/);
  await page.locator(".tour-card a").first().click();
  await expect(page.locator("main.detail h1")).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("Sắp xếp")).toHaveValue("desc");
  await page.reload();
  await expect(page.locator(".results-head")).toContainText("2");
  await expect(page.locator(".search-form input[name=q]")).toHaveValue(
    "CAN THO",
  );
});

test("catalog loading/error/retry and empty states are distinct", async ({
  page,
}) => {
  await page.goto("/tours?demo=network");
  await expect(
    page.getByRole("heading", { name: "Chưa tải được dữ liệu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.locator(".tour-card")).toHaveCount(6);
  await page.goto("/tours?q=zzzzzz-no-tour");
  await expect(
    page.getByRole("heading", { name: "Chưa tìm thấy chuyến đi phù hợp" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc", exact: true }).click();
  await expect(page.locator(".tour-card")).toHaveCount(6);
});

test("gallery supports keyboard, traps focus, restores opener and closes on Escape", async ({
  page,
}) => {
  await page.goto(detailPath);
  const opener = page.getByRole("button", { name: "Xem ảnh 1", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Thư viện ảnh hành trình" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute(
    "src",
    "/image-placeholder.svg",
  );
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText("2 / 5");
  await expect(dialog.locator("img")).toHaveAttribute(
    "src",
    "/image-placeholder.svg",
  );
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    const focused = await dialog.evaluate((node) => ({
      inside: node.contains(document.activeElement),
      tag: document.activeElement?.tagName,
      label: document.activeElement?.getAttribute("aria-label"),
    }));
    expect(focused, `Tab ${i + 1}: focus must remain in dialog`).toMatchObject({
      inside: true,
    });
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("accepting changed prices cannot overwrite a quote for a newly edited voucher or deposit ratio", async ({
  page,
}) => {
  await chooseTour(page);
  await fillContact(page);
  await page.getByLabel("Tình huống kiểm thử").selectOption("price");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(page.locator(".price-review")).toBeVisible();
  await page.locator('input[name=payment-ratio][value="50"]').check();
  await page.getByLabel("Mã ưu đãi").fill("MEKONG100");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await expect(page.locator(".pay-now")).toContainText("1.650.000");
  await expect(page.locator(".summary")).toHaveAttribute("aria-busy", "false");
  await page.getByRole("button", { name: "Chấp nhận báo giá mới" }).click();
  await expect(page.locator(".summary .total")).toContainText("3.300.000");
  await expect(page.locator(".pay-now")).toContainText("1.650.000");
  await page.getByRole("button", { name: /Tạo yêu cầu đặt tour/ }).click();
  await expect(
    page.getByRole("heading", { name: "Đã nhận yêu cầu của bạn" }),
  ).toBeVisible();
});

test("Profiler compares identical typing with and without memoized summary", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "1",
    "Development Profiler is stripped from production.",
  );
  const runs = [];
  for (const mode of ["baseline", "optimized"]) {
    await chooseTour(page);
    await page.goto(
      "/booking" + (mode === "baseline" ? "?profile=baseline" : ""),
    );
    await expect(page.locator(".summary .total")).toContainText("3.200.000");
    await page.waitForFunction(() =>
      window.__MEKONG_DIAGNOSTICS__?.queries.some(
        (item) =>
          item.key.includes("quote") &&
          item.fetchStatus === "idle" &&
          item.status === "success",
      ),
    );
    await page.evaluate(() => {
      window.__MEKONG_DIAGNOSTICS__!.renders = [];
    });
    await page
      .locator("#name")
      .pressSequentially("Nguyen Thi Lan ABC", { delay: 10 });
    const samples = await page.evaluate(
      () => window.__MEKONG_DIAGNOSTICS__!.renders,
    );
    const summary = samples.filter((item) => item.id === "BookingSummary");
    const contact = samples.filter((item) => item.id === "ContactForm");
    runs.push({
      mode,
      typedCharacters: 18,
      summaryCommits: summary.length,
      contactCommits: contact.length,
      summaryActualDurationMs: summary.reduce(
        (sum, item) => sum + item.actualDuration,
        0,
      ),
      samples,
    });
  }
  expect(runs[0].summaryCommits).toBeGreaterThan(0);
  expect(runs[1].summaryCommits).toBe(0);
  expect(runs[1].contactCommits).toBeGreaterThan(0);
  writeFileSync(
    `${evidence}/render-profile.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        method:
          "React Profiler, Chromium, development, StrictMode; deltas after async data settled",
        runs,
      },
      null,
      2,
    ),
  );
});

test("production loads checkout route chunk only when navigating to checkout", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION !== "1",
    "Production manifest and chunks only.",
  );
  await page.goto("/");
  await expect(page.locator("main h1")).toBeVisible();
  const startupScripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((item) => item.name)
      .filter((name) => name.endsWith(".js")),
  );
  expect(startupScripts.some((name) => name.includes("HomePage-"))).toBe(true);
  expect(startupScripts.some((name) => name.includes("CheckoutPage-"))).toBe(
    false,
  );
  await page.locator("main .tour-card a").first().click();
  const card = page.locator(".desktop-booking");
  await card.locator(".dates button").first().click();
  await card.locator("input[type=radio]").first().check();
  await card.getByRole("button", { name: /Tiếp tục đặt tour/ }).click();
  await expect(page.locator("#name")).toBeVisible();
  const after = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((item) => item.name)
      .filter((name) => name.endsWith(".js")),
  );
  expect(after.some((name) => name.includes("CheckoutPage-"))).toBe(true);
  writeFileSync(
    `${evidence}/production-chunk-requests.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        startupScripts,
        afterCheckout: after,
      },
      null,
      2,
    ),
  );
});

test("typing in desktop filters retains input focus while query parameters change", async ({
  page,
}) => {
  await page.goto("/tours");
  const input = page.locator(".filters-desktop input").first();
  await expect(page.locator(".tour-card")).toHaveCount(6);
  await input.pressSequentially("Can Tho", { delay: 30 });
  await expect(input).toHaveValue("Can Tho");
  await expect(input).toBeFocused();
  await expect(page.locator(".results-head")).toContainText("2");
});

test("Vite HMR updates a React component while preserving entered form state", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "1",
    "HMR is a development feature.",
  );
  await chooseTour(page);
  await page.locator("#name").fill("Nguyễn Thị Lan");
  const file = "src/features/booking/components/ContactForm.tsx";
  const original = readFileSync(file, "utf8");
  try {
    writeFileSync(
      file,
      original.replace("Thông tin người đặt", "Thông tin người đặt · HMR"),
    );
    await expect(
      page.getByRole("heading", { name: "Thông tin người đặt · HMR" }),
    ).toBeVisible();
    await expect(page.locator("#name")).toHaveValue("Nguyễn Thị Lan");
    writeFileSync(
      `${evidence}/hmr-check.json`,
      JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          changedComponent: file,
          observedHeadingUpdate: true,
          retainedContactState: true,
          restoredSource: true,
        },
        null,
        2,
      ),
    );
  } finally {
    writeFileSync(file, original);
  }
  await expect(
    page.getByRole("heading", { name: "Thông tin người đặt", exact: true }),
  ).toBeVisible();
});

test("direct routes render one H1 and handle missing selection or record safely", async ({
  page,
}) => {
  for (const [path, title] of [
    ["/booking", /Sắp có thêm/],
    ["/booking/lookup", /Tra cứu yêu cầu đặt tour/],
    ["/booking/missing", /Không tìm thấy yêu cầu/],
    ["/policies", /Rõ ràng trước/],
    ["/tours/missing", /Không tìm thấy tour/],
    ["/missing", /Trang này chưa có/],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("main h1")).toHaveText(title);
    await expect(page.locator("main h1")).toHaveCount(1);
  }
});

test("mobile navigation and filter dialogs retain focus and close with keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/tours");
  const opener = page.getByRole("button", { name: "Mở menu", exact: true });
  await opener.click();
  const menu = page.getByRole("dialog", { name: "Menu điều hướng" });
  await expect(menu).toBeVisible();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(
      await menu.evaluate((node) => node.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await expect(page.locator(".tour-card")).toHaveCount(6);
  await page.getByRole("button", { name: /Lọc hành trình/ }).click();
  const filter = page.getByRole("dialog", { name: "Lọc hành trình" });
  await filter
    .getByLabel("Điểm đến")
    .pressSequentially("Can Tho", { delay: 30 });
  await expect(filter.getByLabel("Điểm đến")).toHaveValue("Can Tho");
  await expect(filter.getByLabel("Điểm đến")).toBeFocused();
  await filter.getByRole("button", { name: /Xem kết quả/ }).click();
  await expect(filter).not.toBeVisible();
  await expect(page.locator(".tour-card")).toHaveCount(2);
});

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`responsive layout at ${width}px: detail, listing and checkout`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, path] of [
      ["detail", detailPath],
      ["listing", "/tours"],
    ]) {
      await page.goto(path);
      await expect(
        page.locator(name === "detail" ? "main.detail" : "main.listing"),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${evidence}/${name}-${width}.png`,
        fullPage: true,
      });
    }
    await page.goto(detailPath);
    const card = page.locator(
      width < 1024 ? ".mobile-booking" : ".desktop-booking",
    );
    await card.locator(".dates button").first().click();
    await card.locator("input[type=radio]").first().check();
    await card.getByRole("button", { name: /Tiếp tục đặt tour/ }).click();
    await expect(page.locator("#name")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".mobile-bottom")).toHaveCount(0);
    await page.screenshot({
      path: `${evidence}/checkout-${width}.png`,
      fullPage: true,
    });
  });
}
