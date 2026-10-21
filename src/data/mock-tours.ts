export const photos = [
  {
    src: "https://images.unsplash.com/photo-1583531771478-ba91a8c29044?auto=format&fit=crop&w=1600&q=85",
    alt: "Xuồng du lịch giữa tán dừa nước miền Tây",
  },
  {
    src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=85",
    alt: "Thuyền trên dòng sông Việt Nam",
  },
  {
    src: "https://images.unsplash.com/photo-1647338394893-a2519b9147bf?auto=format&fit=crop&w=800&q=85",
    alt: "Ghe chở trái cây trên dòng Mekong",
  },
  {
    src: "https://images.unsplash.com/photo-1589562337460-9d825d2cd5a2?auto=format&fit=crop&w=800&q=85",
    alt: "Những chiếc xuồng trên sông Mekong",
  },
  {
    src: "https://images.unsplash.com/photo-1562004966-39bfac0faf6b?auto=format&fit=crop&w=800&q=85",
    alt: "Đi xuồng ở Quới Sơn, Bến Tre",
  },
];
export const packages = [
  {
    id: "p3",
    name: "Khách sạn 3 sao",
    hotelStars: 3,
    adultPrice: 1600000,
    childPrice: 1200000,
    infantPrice: 0,
    singleRoomSupplement: 300000,
    features: "Phòng tiêu chuẩn · Bữa sáng tại khách sạn",
  },
  {
    id: "p4",
    name: "Khách sạn 4 sao",
    hotelStars: 4,
    adultPrice: 1950000,
    childPrice: 1462500,
    infantPrice: 0,
    singleRoomSupplement: 550000,
    features: "Phòng cao cấp · Buffet sáng · Hồ bơi",
  },
  {
    id: "p5",
    name: "Khách sạn 5 sao",
    hotelStars: 5,
    adultPrice: 2350000,
    childPrice: 1762500,
    infantPrice: 0,
    singleRoomSupplement: 850000,
    features: "Phòng deluxe · Buffet sáng · Tiện ích nghỉ dưỡng",
  },
];
const titles = [
  "Mỹ Tho – Bến Tre – Cần Thơ",
  "Cần Thơ – Chợ nổi Cái Răng",
  "Bến Tre – Về miền dừa xanh",
  "Châu Đốc – Rừng tràm Trà Sư",
  "Sa Đéc – Mùa hoa bên sông",
  "Cà Mau – Chạm miền đất cuối",
  "Vĩnh Long – Một ngày miệt vườn",
  "Hà Tiên – Mùa nắng phương Nam",
];
const itineraries = [
  [
    "TP.HCM → Mỹ Tho → Bến Tre → Cần Thơ",
    "Chợ nổi Cái Răng → Miệt vườn → TP.HCM",
  ],
  [
    "TP.HCM → Cần Thơ → Bến Ninh Kiều",
    "Chợ nổi Cái Răng → Vườn trái cây → TP.HCM",
  ],
  ["TP.HCM → Bến Tre → Làng nghề dừa", "Cù lao xanh → Vườn cây → TP.HCM"],
  ["TP.HCM → Châu Đốc → Núi Sam", "Rừng tràm Trà Sư → TP.HCM"],
  ["TP.HCM → Sa Đéc → Làng hoa", "Nhà cổ → Bờ sông Tiền → TP.HCM"],
  ["TP.HCM → Cà Mau → Thành phố Cà Mau", "Đất Mũi → Rừng ngập mặn → TP.HCM"],
  ["TP.HCM → Vĩnh Long → Cù lao An Bình → TP.HCM"],
  ["TP.HCM → Hà Tiên → Phố biển", "Thạch Động → Bãi biển → TP.HCM"],
];
export const tours = titles.map((title, i) => ({
  id: `t${i}`,
  slug: [
    "my-tho-ben-tre-can-tho",
    "can-tho-cai-rang",
    "ben-tre",
    "chau-doc-tra-su",
    "sa-dec",
    "ca-mau",
    "vinh-long",
    "ha-tien",
  ][i],
  title,
  destinations: title.split(" – "),
  departureLocation: "TP. Hồ Chí Minh",
  durationDays: i === 6 ? 1 : 2,
  images: photos,
  highlights:
    i === 0
      ? [
          "Len lỏi dưới tán dừa nước bằng xuồng ba lá",
          "Thưởng thức hương vị miền Tây từ bếp địa phương",
          "Đón bình minh trên sông và khám phá chợ nổi",
          "Thảnh thơi nghỉ đêm giữa lòng Tây Đô",
        ]
      : [
          `Khám phá ${title} cùng hướng dẫn viên`,
          "Thưởng thức bữa ăn địa phương theo lịch trình",
          "Gặp gỡ nhịp sống bình dị miền sông nước",
          i === 6
            ? "Trọn một ngày giữa những vườn cây xanh"
            : "Nghỉ đêm theo tiêu chuẩn khách sạn bạn chọn",
        ],
  itinerary: itineraries[i],
  policies: "Chính sách demo, chỉ dùng để trải nghiệm.",
}));
const today = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
);
export const departures = tours.flatMap((t) =>
  [1, 3, 5, 7, 10, 14].map((days, i) => {
    const date = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + days,
        0,
      ),
    );
    return {
      id: `${t.id}-${date.toISOString().slice(0, 10)}`,
      tourId: t.id,
      startAt: date.toISOString(),
      bookingCutoffAt: new Date(+date - 6 * 3600000).toISOString(),
      availableSeats: [18, 8, 2, 0, 12, 16][i],
      status: i === 3 ? "sold_out" : "open",
      premium: i === 4 ? 200000 : 0,
      unavailablePackage: i === 1 ? "p5" : "",
    };
  }),
);
export const dateLabel = (s: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(s));
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export const departurePackagePrices = departures.flatMap((d) =>
  packages.map((p) => {
    const base = [
      1600000, 1450000, 1350000, 1850000, 1250000, 2450000, 850000, 2250000,
    ][Number(d.tourId.slice(1))];
    const delta = base - 1600000;
    return {
      departureId: d.id,
      packageId: p.id,
      adultPrice: p.adultPrice + delta + d.premium,
      childPrice: Math.round((p.adultPrice + delta + d.premium) * 0.75),
      infantPrice: 0,
      available: d.unavailablePackage !== p.id,
    };
  }),
);
export function startingPrice(tourId: string, date = "") {
  const open = departures.filter(
    (d) =>
      d.tourId === tourId &&
      d.status === "open" &&
      d.availableSeats > 0 &&
      Date.parse(d.bookingCutoffAt) > Date.now() &&
      (!date || dateLabel(d.startAt).split("/").reverse().join("-") === date),
  );
  const prices = departurePackagePrices.filter(
    (p) => p.available && open.some((d) => d.id === p.departureId),
  );
  return prices.length ? Math.min(...prices.map((p) => p.adultPrice)) : null;
}
