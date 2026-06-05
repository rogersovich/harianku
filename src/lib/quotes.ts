export const quotes = [
  "Masak sendiri itu investasi terbaik untuk kesehatanmu. ☀️",
  "Tubuh sehat dimulai dari apa yang kamu jadwalkan di piringmu. 🥗",
  "Satu langkah kecil hari ini adalah awal dari konsistensi esok hari. 💪",
  "Kunci konsistensi adalah memulai, kunci keberhasilan adalah meneruskan. ✨",
  "Makanan bergizi adalah bahan bakar terbaik untuk tubuh aktifmu. 🍎",
  "Olahraga tidak hanya mengubah fisikmu, tapi juga menjernihkan pikiranmu. 🏃",
  "Hidup sehat bukan tujuan akhir, melainkan perjalanan sehari-hari. 🍃",
  "Dapurmu adalah apotek terbaik untuk kesehatan jangka panjangmu. 🍳",
  "Setiap tetes keringat membawamu lebih dekat ke target mingguanmu. 💦",
  "Rencanakan harimu, jalani prosesnya, nikmati hasilnya. 📅",
  "Tubuhmu bisa bertahan dalam kondisi apa pun, pikiranmu yang harus kamu yakinkan. 🧠",
  "Menyiapkan makanan sendiri adalah wujud menghargai diri sendiri. ❤️",
  "Kesehatan bukanlah segalanya, tapi tanpa kesehatan segalanya bukan apa-apa. 🌟",
  "Mulai dengan yang mudah, yang penting rutin dan teratur. 👍",
  "Disiplin adalah memilih antara apa yang kamu inginkan sekarang dan apa yang paling kamu inginkan. 🎯",
  "Sedikit kemajuan setiap hari menambah hasil yang besar. 📈",
  "Jangan bandingkan dirimu dengan orang lain, bandingkan dengan dirimu kemarin. 🧘",
  "Kebiasaan baik yang konsisten mengalahkan motivasi yang meledak-ledak. 🔥",
  "Makanan sehat bisa terasa sangat lezat jika dimasak dengan penuh cinta. 🍲",
  "Gerakkan tubuhmu hari ini agar esok hari terasa lebih ringan. 🍃",
  "Setiap makanan sehat yang kamu pilih adalah bentuk investasi masa depan. 💎",
  "Jangan tunggu besok untuk mulai hidup sehat, mulailah dari suapan pertama hari ini. 🍌",
  "Olahraga 20 menit jauh lebih baik daripada tidak olahraga sama sekali. 👟",
  "Stok dapur rapi, pikiran tenang, masak jadi menyenangkan! 📦",
  "Kesehatan adalah hubungan dinamis antara makanan, pikiran, dan gerakan tubuh. 🔄",
  "Tubuh adalah satu-satunya tempat tinggalmu yang permanen. Rawatlah dengan baik. 🏡",
  "Konsisten masak di rumah bikin dompet dan tubuh sama-sama tersenyum. 🪙",
  "Tantang dirimu hari ini demi kenyamanan dirimu di masa tua. 🏅",
  "Semangat hari ini! Jadikan olahraga sebagai waktu me-time yang menyenangkan. 🎵",
  "Makan sehat itu mudah kalau sudah direncanakan. Mari mulai mengisi meal plan! 📝"
]

export function getRandomQuote(): string {
  const day = new Date().getDate()
  return quotes[day % quotes.length]
}
