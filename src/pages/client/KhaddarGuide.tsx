import { Link } from 'react-router-dom'
import { Accordion } from '../../components/client/Primitives'
import Icon from '../../components/client/Icon'

const photo = (path: string) => ({ backgroundImage: `url('/assets/fashion/${path}.webp')` })
const RANGES = [
  ['Pure', 'PH', 'Plain, solid-colour khaddar with an even weave. Easy to wear to the office, Friday prayers or a family dinner.', 'khaddar/handmade-khaddar-suit-for-men-flecked-cream-pure-ph-18-1'],
  ['Winter', 'KK', 'A dense weave with mixed-colour yarn, made for cold mornings and evenings.', 'khaddar/handmade-khaddar-suit-for-men-denim-blue-winter-kk-124-1'],
  ['Desi', 'DH', 'Our most traditional khaddar: thick yarn, natural slubs and a texture you can feel.', 'khaddar/handmade-khaddar-suit-for-men-golden-camel-desi-dh-06-1'],
  ['Designer', 'HK', 'Two-tone streaked yarn, so the fabric looks rich up close and stays smart from a distance.', 'khaddar/handmade-khaddar-suit-for-men-mustard-gold-designer-hk-24-1'],
] as const
const WHY = [
  ['Woven on a khaddi', 'Every suit is woven on a traditional hand loom in Kamalia, Punjab. The small irregularities in the weave are the mark of real handloom khaddar.', 'weaving-hands'],
  ['100% cotton, chemical-free', 'Non-chemicalized cotton that breathes, feels soft on the skin and keeps its lustre. Colour and fabric are guaranteed.', 'cotton-texture'],
  ['Warm, yet breathable', 'The thick, open weave holds warmth on winter days without feeling heavy or trapping heat indoors.', 'craft-loom'],
  ['Softer with every wash', 'Khaddar starts with a crisp hand and relaxes into a softer, more comfortable fabric the more you wear and wash it.', 'heritage-loom'],
] as const
const STITCH = [
  ['Unstitched, cut to you', 'Every suit arrives as unstitched fabric with matching buttons, so your tailor can cut a kameez shalwar exactly to your size and style.', 'tailor-measure'],
  ['Pre-wash before cutting', 'Natural cotton can relax slightly in its first wash. Many tailors soak khaddar once before cutting. Ask yours what they prefer.', 'tailor-chalk'],
  ['Choose your style', 'Khaddar suits a classic kameez shalwar, a kurta pajama or a waistcoat set. Its body holds collars, cuffs and pleats well.', 'tailor-workshop'],
] as const
const CARE = [
  ['Wash cold, separately', 'Hand wash or use a gentle cycle in cold water with a mild detergent. Wash dark colours on their own for the first few washes.'],
  ['Dry in the shade', 'Dry inside out, away from strong sunlight, which fades deep browns, navies and greens over time. Avoid wringing.'],
  ['Iron while slightly damp', 'Use a medium-hot cotton setting, or press inside out to keep the surface texture.'],
  ['Store clean and dry', 'Fold loosely in a breathable cotton bag in a cool, dry place. Cedar helps keep moths away.'],
] as const
const FAQS = [
  ['What is khaddar?', 'Khaddar (also called khaddi or khadi) is a hand-spun, hand-woven cotton fabric. Its thick, slightly uneven weave makes it warm, breathable and long-lasting, and it is a winter favourite for men’s suits in Pakistan.'],
  ['Why Kamalia khaddar?', 'Kamalia in Punjab has woven khaddar for generations and is known across Pakistan for the quality of its handloom cotton. All Khaddar Virsa fabric comes from Kamalia.'],
  ['Is it stitched?', 'No. Our suits are unstitched fabric, so your tailor can cut it to your exact size and style. Matching buttons are included.'],
  ['Which range should I choose?', 'Pure for everyday and office wear, Winter for the coldest months, Desi for the most traditional look and feel, and Designer when you want a richer, two-tone finish for events.'],
  ['Will the colours run?', 'Deep dyes may release a little colour in the first wash. Wash dark pieces separately in cold water.'],
  ['Does khaddar need dry cleaning?', 'No. A gentle cold wash at home keeps cotton khaddar fresh. Dry clean only if your tailor added linings or trims that need it.'],
  ['Can I check the fabric before paying?', 'Yes. Delivery is free across Pakistan with Cash on Delivery, and you may open the parcel before accepting it. Returns are accepted within 15 days.'],
  ['Is khaddar only for winter?', 'Khaddar is best known as winter wear, but lighter Pure weaves are comfortable in spring and autumn too.'],
]

export default function KhaddarGuide() {
  return <>
    <section className="care-hero">
      <div className="care-hero-photo" style={photo('craft-loom')} role="img" aria-label="Khaddar being woven on a traditional hand loom" />
      <div className="care-hero-copy">
        <div className="care-crumb"><Link to="/">Home</Link><span>/</span>Khaddar Guide</div>
        <h1>The Khaddar Guide</h1>
        <h2>From the Kamalia Loom to Your Wardrobe</h2>
        <p>Everything you need to know about handwoven khaddar: what it is, how our four ranges differ, how to have it stitched, and how to care for it so it lasts for years.</p>
        <Link className="btn" to="/shop">Shop Khaddar Suits <Icon name="arrow" /></Link>
      </div>
    </section>

    <section className="care-essentials">
      <h2>Why Kamalia Khaddar</h2>
      <p className="care-intro">Khaddar is hand-spun, hand-woven cotton. Ours is woven on traditional khaddis in Kamalia, Punjab, with no chemical finishing.</p>
      <div className="care-grid">{WHY.map(([title, body, img]) => <article className="care-card" key={title}>
        <div role="img" aria-label={title} className="care-card-photo" style={photo(img)} />
        <div className="care-card-body"><h3>{title}</h3><p>{body}</p></div>
      </article>)}</div>
    </section>

    <section className="care-essentials">
      <h2>Our Four Ranges</h2>
      <p className="care-intro">Each range has its own code, shown on every product, so you can find the weave you like.</p>
      <div className="care-grid">{RANGES.map(([name, code, body, img]) => <Link to={`/shop?q=${code}`} className="care-card" key={name}>
        <div role="img" aria-label={`${name} range khaddar suit`} className="care-card-photo" style={photo(img)} />
        <div className="care-card-body"><h3>{name} <small>({code})</small></h3><p>{body}</p></div>
      </Link>)}</div>
    </section>

    <section className="care-essentials">
      <h2>From Fabric to Suit</h2>
      <p className="care-intro">A few tips to take to your tailor.</p>
      <div className="care-grid">{STITCH.map(([title, body, img]) => <article className="care-card" key={title}>
        <div role="img" aria-label={title} className="care-card-photo" style={photo(img)} />
        <div className="care-card-body"><h3>{title}</h3><p>{body}</p></div>
      </article>)}</div>
    </section>

    <section className="care-essentials">
      <h2>Caring for Khaddar</h2>
      <p className="care-intro">Simple care keeps your suit soft and its colour deep for many seasons.</p>
      <div className="care-grid">{CARE.map(([title, body], i) => <article className="care-card" key={title}>
        <div className="care-card-body"><h3>{i + 1}. {title}</h3><p>{body}</p></div>
      </article>)}</div>
    </section>

    <section className="care-questions">
      <div className="care-question-heading"><div><div className="eyebrow">GOOD TO KNOW</div><h2>Khaddar Questions</h2><p>Quick answers about our fabric, ranges and delivery.</p></div><p>Still have a question? <Link className="inline-link" to="/contact?topic=Product%20advice">Contact Us →</Link></p></div>
      <div className="care-faq-grid">{[FAQS.slice(0, 4), FAQS.slice(4)].map((column, i) => <div key={i}>{column.map(([q, a]) => <Accordion title={q} key={q}><p>{a}</p></Accordion>)}</div>)}</div>
      <div className="care-support"><div><div className="eyebrow">WE’RE HERE TO HELP</div><h3>Not Sure Which Suit to Pick?</h3><p>Tell us the occasion and the colours you like,<br className="desktop-only" /> and we’ll suggest the right khaddar for you.</p></div><div className="care-support-action"><Link className="btn" to="/contact?topic=Product%20advice"><Icon name="mail" /> Ask Us <Icon name="arrow" /></Link><small>Call or WhatsApp +92 342 4307737.</small></div></div>
    </section>
  </>
}
