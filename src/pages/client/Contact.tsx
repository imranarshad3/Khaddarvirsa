import { storeWrite } from '../../lib/storeApi'
import Select from '../../components/ui/Select'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { readableError } from '../../lib/supabase'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { PageBanner, ProcessSteps, SectionTitle } from '../../components/client/Sections'
import Icon from '../../components/client/Icon'
import { Spinner } from '../../components/client/Primitives'
import { useBanner } from '../../lib/useBanner'

const TOPICS = ['Order enquiry', 'Product advice', 'Custom sizing', 'Fabric care', 'Delivery & returns', 'Something else']

const HELP: [string, string, string][] = [
  ['01', 'Orders & Delivery', 'Questions about your shipment'],
  ['02', 'Fabric Care', 'Advice to keep your pieces beautiful'],
  ['03', 'Custom Orders', 'Start a tailored inquiry'],
]

export default function Contact() {
  const visit = useBanner('contact_visit')
  const { store, contactNotes } = useStore()
  const toast = useToast()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    topic: params.get('topic') ?? '',
    message: '',
  })

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await storeWrite('contact',{
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      topic: form.topic,
      message: form.message.trim(),
    })
    setBusy(false)
    if (error) {
      toast.error(readableError(error))
      return
    }
    setSent(true)
    setForm({ first_name: '', last_name: '', email: '', phone: '', topic: '', message: '' })
    toast.success('Thank you — your message has reached our team.')
  }

  const channels: [string, string, string, string | null][] = [
    ['mail', 'Email', store.email || contactNotes.email_note || 'Contact information to be configured', store.email ? `mailto:${store.email}` : null],
    [
      'phone',
      'Phone / WhatsApp',
      store.phone || store.whatsapp || contactNotes.phone_note || 'Business number to be configured',
      store.phone ? `tel:${store.phone.replace(/\s/g, '')}` : null,
    ],
    ['pin', 'Location', store.location || contactNotes.location_note || 'Showroom information to be confirmed', null],
  ]

  return (
    <>
      <PageBanner
        placement="contact_hero"
        title="Contact Us"
        eyebrow="WE ARE HERE TO HELP"
        description="Questions about fabrics, colours or your order? Our team would love to hear from you."
        cta="Send a Message"
        ctaTo="#inquiry-form"
        editorial
        className="photo-hero contact-hero"
        image="/assets/fashion/contact-hero-wide.webp"
        imageSrcSet="/assets/fashion/contact-hero-wide-800.webp 800w, /assets/fashion/contact-hero-wide-1280.webp 1280w, /assets/fashion/contact-hero-wide.webp 1855w"
      />

      <section className="section wrap">
        <div className="twocol">
          <div>
            <div className="eyebrow">GET IN TOUCH</div>
            <h2>
              We’d Love to Hear
              <br />
              from You
            </h2>
            <p style={{ margin: '16px 0 28px' }}>
              Whether you need product advice, custom sizing or help with your order, send us an inquiry and we’ll help
              you find the answers.
            </p>
            {channels.map(([icon, label, value, href]) => (
              <div className="contactline" key={label}>
                <i aria-hidden="true"><Icon name={icon as 'mail' | 'phone' | 'pin'} /></i>
                <div>
                  <h3>{label}</h3>
                  <p>{href ? <a href={href}>{value}</a> : value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card" id="inquiry-form">
            <div className="eyebrow">SEND A MESSAGE</div>
            <h2 style={{ marginBottom: 20 }}>Inquiry Form</h2>

            {sent && (
              <div className="notice success" style={{ marginBottom: 18 }}>
                Your message has been received. We usually reply within one working day.
              </div>
            )}

            <form onSubmit={submit}>
              <div className="formtwocol">
                <label className="field">
                  First Name
                  <input value={form.first_name} onChange={set('first_name')} placeholder="Your first name" required />
                </label>
                <label className="field">
                  Last Name
                  <input value={form.last_name} onChange={set('last_name')} placeholder="Your last name" />
                </label>
                <label className="field">
                  Email Address
                  <input type="email" value={form.email} onChange={set('email')} placeholder="name@example.com" required />
                </label>
                <label className="field">
                  Phone Number
                  <input value={form.phone} onChange={set('phone')} placeholder="Optional" />
                </label>
              </div>
              <label className="field">
                Topic
                <Select aria-label="Subject" value={form.topic} onChange={set('topic')} required>
                  <option value="">Choose a topic</option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="field">
                Your Message
                <textarea value={form.message} onChange={set('message')} placeholder="Tell us how we can help..." required minLength={10} />
              </label>
              <button className="btn" type="submit" disabled={busy}>
                {busy ? <Spinner label="Sending" /> : 'Send Message →'}
              </button>
              <p className="contact-privacy"><Icon name="heart" />Your information will only be used to respond to your inquiry.</p>
            </form>
          </div>
        </div>
      </section>

      <section className="contact-location">
        <div className="contact-location-copy"><div className="eyebrow">{visit?.eyebrow || 'A MORE PERSONAL EXPERIENCE'}</div><h2>{visit?.title || 'Let’s Find the Right Piece for You'}</h2><p>{visit?.subtitle || 'Visit our Lahore store for shopping and exchanges, open every day from 9 am to 5 pm, including Sunday.'}</p>{store.location && <p className="location-address"><Icon name="pin" />{store.location}</p>}<Link className="btn" to={(visit?.cta_label && visit.link_url) || '/contact?topic=Product%20advice'}>{(visit?.link_url && visit.cta_label) || 'Plan Your Inquiry'} <Icon name="arrow" /></Link></div>
        <div className="contact-location-photo" style={visit?.image_url ? { backgroundImage: `url('${visit.image_url}')` } : undefined} role="img" aria-label="Man in a khaddar suit in a haveli courtyard beside stacks of folded khaddar fabric" />
      </section>

      <section className="section cream">
        <div className="wrap">
          <SectionTitle eyebrow="QUICK ANSWERS" title="Frequently Asked Questions" linkTo="/page/faqs" linkLabel="Read all FAQs →" />
          <ProcessSteps steps={HELP} />
          <p className="subtitle" style={{ marginTop: 22 }}>
            Looking for care advice? Visit our{' '}
            <Link className="inline-link" to="/khaddar-guide">
              Khaddar Guide
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
