export default function PaymentLogos({ small = false, online = false }: { small?: boolean; online?: boolean }) {
  // Card logos only when an online gateway is actually configured.
  const logos = online ? ['cod', 'bank', 'visa', 'master'] : ['cod', 'bank'];
  return (
    <span className="inline-flex items-center gap-1.5">
      {logos.map((l) => (
        <img key={l} src={`/brand/${l}.svg`} alt={{ cod: 'Cash on delivery', bank: 'Bank transfer', visa: 'Visa', master: 'Mastercard' }[l]}
          className={small ? 'h-5 w-auto' : 'h-7 w-auto'} width={small ? 32 : 44} height={small ? 20 : 28} />
      ))}
    </span>
  );
}
