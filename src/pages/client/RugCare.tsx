import { Link } from 'react-router-dom'
import { Accordion } from '../../components/client/Primitives'
import Icon from '../../components/client/Icon'

const TIPS = [
  ['Gentle Cleaning', 'Dry clean embroidered and luxury pieces. Hand wash everyday lawn and cotton gently in cold water with a mild detergent.', 'vacuum'],
  ['Stain Care', 'Blot spills immediately with a clean, dry cloth. Test a mild, pH-neutral soap on a hidden area first. Avoid harsh chemicals or rubbing.', 'drop'],
  ['Rotate Your Shawls', 'Wear and air your shawls in turn so no single piece takes all the wear, and refold along different lines.', 'rotate'],
  ['Storing Shawls', 'Make sure each piece is clean and dry. Fold loosely, wrap in a breathable cotton bag and keep in a cool, dry place away from moths.', 'box'],
  ['Protect Fine Fabrics', 'Keep wool, pashmina and silk away from direct sunlight and damp to preserve their softness and colour.', 'leaf'],
  ['Embroidery Care', 'Iron embroidered pieces inside out on low heat with a pressing cloth, and never wring or tumble dry them.', 'spark'],
] as const
const FAQS = [
  ['How should I wash my shawl?', 'Dry cleaning is safest for wool, pashmina and embroidered shawls. If the care label allows, hand wash in cold water with a mild wool wash and dry flat in the shade.'],
  ['What’s the best way to remove stains?', 'Blot immediately with a clean, dry cloth. Do not rub. Test a mild cleaning solution on a hidden spot first, and ask a professional dry cleaner about persistent stains.'],
  ['Can I iron embroidered pieces?', 'Yes, inside out on a low setting with a pressing cloth. Avoid steaming directly over beadwork, sequins or zari.'],
  ['How do I store my shawls?', 'Make sure they are clean and completely dry, fold loosely, and wrap in a breathable cotton bag. Natural moth repellents such as cedar help in storage.'],
  ['Will my wool shawl shed?', 'A little shedding is normal with natural wool, particularly when a shawl is new. It settles after the first few wears.'],
  ['Will the colours run?', 'Deep and bright dyes may release colour in the first wash. Wash dark pieces separately in cold water, or choose dry cleaning.'],
  ['How often should I dry clean?', 'It depends on how often you wear a piece. Shawls usually need cleaning once or twice a season; formal wear after each event where it was worn for long.'],
  ['What if my outfit gets wet?', 'Blot away moisture and dry flat or on a padded hanger with good airflow, away from direct heat and sunlight.'],
]
function CareIcon({ name }: { name: typeof TIPS[number][2] }) {
  if (name === 'leaf' || name === 'spark') return <Icon name={name} />
  const paths = {
    vacuum: <><path d="m15 3-3 14M10 17h6l3 4H6l4-4ZM14 7l3 1M8 14H5v7H2v-8a3 3 0 0 1 6 0v1Z" /></>,
    drop: <><path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" /><path d="M9 14c-1 3 1 4 3 4" /></>,
    rotate: <><path d="M20 9A8 8 0 0 0 5 6L3 9m0-6v6h6M4 15a8 8 0 0 0 15 3l2-3m0 6v-6h-6" /></>,
    box: <><path d="M4 8h16v13H4zM3 4h18v4H3zM9 12h6" /></>,
  }
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
export default function RugCare() {
  return <>
    <section className="care-hero">
      <div className="care-hero-photo care-photo-2" />
      <div className="care-hero-copy">
        <div className="care-crumb"><Link to="/">Home</Link><span>/</span>Fabric Care</div>
        <h1>Fabric Care</h1>
        <h2>Simple Care for a Longer, More Beautiful Life</h2>
        <p>Our shawls and outfits are crafted to be worn and loved for years. With a little care, your Khaddar Virsa pieces will keep their softness, colour and beauty for seasons to come.</p>
        <Link className="btn" to="/shop">Shop the Collection <Icon name="arrow" /></Link>
      </div>
    </section>
    <section className="care-essentials">
      <h2>Care Essentials</h2>
      <p className="care-intro">Follow these simple steps to keep your Khaddar Virsa pieces looking beautiful for years to come.</p>
      <div className="care-grid">{TIPS.map(([title, body, icon], i) => <article className="care-card" key={title}>
        <div role="img" aria-label={title} className={`care-card-photo care-photo-${i}`} />
        <div className="care-card-body"><span className="care-icon"><CareIcon name={icon} /></span><h3>{i + 1}. {title}</h3><p>{body}</p></div>
      </article>)}</div>
    </section>
    <section className="care-questions">
      <div className="care-question-heading"><div><div className="eyebrow">A LITTLE GUIDANCE</div><h2>Frequently Asked Questions</h2><p>Everything you need to know about caring for your Khaddar Virsa pieces.</p></div><p>Still have a question? <Link className="inline-link" to="/contact?topic=Fabric%20care">Contact Us →</Link></p></div>
      <div className="care-faq-grid">{[FAQS.slice(0,4), FAQS.slice(4)].map((column,i)=><div key={i}>{column.map(([q,a])=><Accordion title={q} key={q}><p>{a}</p></Accordion>)}</div>)}</div>
      <div className="care-support"><svg width="72" height="72" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 35v-5a21 21 0 0 1 42 0v9M11 27H8a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h7V27h-4Zm42 0h3a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-7V27h4ZM53 47c0 8-9 10-17 10" /><rect x="27" y="54" width="10" height="6" rx="3" /></svg><div><div className="eyebrow">WE’RE HERE TO HELP</div><h3>Need More Advice?</h3><p>Our team is happy to help with personalized care<br className="desktop-only" /> recommendations for your Khaddar Virsa pieces.</p></div><div className="care-support-action"><Link className="btn" to="/contact?topic=Fabric%20care"><Icon name="mail" /> Contact Support <Icon name="arrow" /></Link><small>Let’s find the right care for your pieces.</small></div></div>
      <h3 className="care-gallery-heading">More Inspiration for a Beautiful Wardrobe</h3>
      <div className="care-gallery">{[4,2,0,5,3,2].map((position,i)=><Link to="/collections" aria-label="Explore our collections" className={`care-photo-${position}`} key={i} />)}</div>
    </section>
  </>
}
