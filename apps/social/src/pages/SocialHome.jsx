import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SocialHome() {
  const [topic, setTopic] = useState('our new cafe opening');
  const [vibe, setVibe] = useState(0);
  const [occ, setOcc] = useState(0);
  const [cat, setCat] = useState('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(0);

  const btn = (on) => on ? { background: '#BE185D', color: '#fff', borderColor: '#BE185D' } : { background: '#fff', color: '#2B1030' };

  const t = topic.trim() || 'your big news';
  const T = t.charAt(0).toUpperCase() + t.slice(1);
  const V = [
    ['Fun', ['Plot twist: ' + t + '. And yes, we are a little obsessed.', T + ' is happening and we cannot keep calm.', 'Tag someone who needs to see ' + t + ' right now.'], ['#funtimes', '#vibes']],
    ['Aesthetic', ['Soft light, slow days, ' + t + '.', T + '. Quietly beautiful, just like this moment.', 'Collecting little moments like ' + t + '.'], ['#aesthetic', '#softlife']],
    ['Motivational', ['Small steps lead to big things: ' + t + '.', 'Start before you feel ready. Today it is ' + t + '.', T + ': proof that showing up works.'], ['#motivation', '#keepgoing']],
    ['Professional', ['Excited to share: ' + t + '. Details in the comments.', 'Introducing ' + t + '. Built with care for you.', 'Big news from our team: ' + t + '.'], ['#smallbusiness', '#announcement']]
  ];
  const O = [
    ['Any', '', []],
    ['Festival', ' Wishing you a bright and happy festival season.', ['#festivevibes', '#celebrate']],
    ['Birthday', ' Cake, candles and good company.', ['#birthday', '#celebration']],
    ['Travel', ' The journey is the best part.', ['#travelgram', '#wanderlust']],
    ['Food', ' Come hungry.', ['#foodie', '#foodlover']],
    ['Fitness', ' Stronger every day.', ['#fitness', '#gymlife']],
    ['Shop launch', ' Open now. Visit us today.', ['#newlaunch', '#shoplocal']]
  ];
  const v = V[vibe], o = O[occ];
  const captions = v[1].map((c) => { const text = c + o[1]; return { text, count: text.length }; });
  const words = t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3).slice(0, 3).map((w) => '#' + w);
  const tags = Array.from(new Set(words.concat(v[2], o[2], ['#instagood', '#reels']))).slice(0, 9);
  const vibes = V.map((x, i) => ({ label: x[0], on: vibe === i, style: btn(vibe === i), pick: () => setVibe(i) }));
  const occasions = O.map((x, i) => ({ label: x[0], on: occ === i, style: btn(occ === i), pick: () => setOcc(i) }));

  const kinds = [
    ['Post', { background: '#FBCFE8', color: '#831843' }],
    ['Reel', { background: '#DDD6FE', color: '#4C1D95' }],
    ['Story', { background: '#FDE68A', color: '#78350F' }],
    ['Festival', { background: '#BBF7D0', color: '#14532D' }],
    ['Post', { background: '#FBCFE8', color: '#831843' }],
    ['Reel', { background: '#DDD6FE', color: '#4C1D95' }],
    ['Story', { background: '#FDE68A', color: '#78350F' }]
  ];
  const days = Array.from({ length: 28 }, (_, i) => {
    const k = (i === 11 || i === 24) ? kinds[3] : kinds[(i * 3 + Math.floor(i / 7)) % 3];
    return { n: i + 1, type: k[0], style: k[1] };
  });

  const col = { Write: ['#BE185D', '#FCE7F3'], Plan: ['#6D28D9', '#EDE9FE'], Grow: ['#B45309', '#FEF3C7'] };
  const slugs = {
    'Instagram Caption Generator': 'instagram-caption-generator',
    'Bio Generator': 'bio-generator',
    'Tweet Generator': 'tweet-generator',
    'Comment Reply Generator': 'comment-reply-generator',
    'Reel Hook Generator': 'reel-hook-generator',
    'Content Calendar': 'content-calendar',
    'Festival Post Planner': 'festival-post-planner',
    'Post Ideas Generator': 'post-ideas-generator',
    'Reel Ideas Generator': 'reel-ideas-generator',
    'Best Time to Post': 'best-time-to-post',
    'Hashtag Generator': 'hashtag-generator',
    'YouTube Title Generator': 'youtube-title-generator',
    'YouTube Description Generator': 'youtube-description-generator',
    'YouTube Tag Generator': 'youtube-tag-generator',
    'Username Generator': 'username-generator',
    'Giveaway Winner Picker': 'giveaway-winner-picker'
  };
  const TL = [
    ['Instagram Caption Generator', 'Hinglish captions with occasion filters', 'Write', 0],
    ['Bio Generator', 'Instagram, LinkedIn and WhatsApp About', 'Write', 0],
    ['Tweet Generator', 'Single posts and thread format', 'Write', 0],
    ['Comment Reply Generator', 'Reply in the tone you choose', 'Write', 1],
    ['Reel Hook Generator', 'Strong first-three-second openers', 'Write', 1],
    ['Content Calendar', '30-day plan by niche', 'Plan', 1],
    ['Festival Post Planner', 'Indian festival calendar', 'Plan', 1],
    ['Post Ideas Generator', 'Ideas around festivals and trends', 'Plan', 0],
    ['Reel Ideas Generator', 'Niche-wise ideas for gyms, food, fashion and more', 'Plan', 0],
    ['Best Time to Post', 'Timing for Indian audiences', 'Plan', 1],
    ['Hashtag Generator', 'Niche and festival context', 'Grow', 0],
    ['YouTube Title Generator', 'Hindi and English SEO titles', 'Grow', 0],
    ['YouTube Description Generator', 'Chapters and links included', 'Grow', 0],
    ['YouTube Tag Generator', 'Keyword-driven tags', 'Grow', 1],
    ['Username Generator', 'Handle ideas for any niche', 'Grow', 1],
    ['Giveaway Winner Picker', 'A random, fair pick', 'Grow', 1]
  ];
  const q = query.trim().toLowerCase();
  const matchesQuery = (x) => !q || x[0].toLowerCase().includes(q) || x[1].toLowerCase().includes(q) || x[2].toLowerCase().includes(q);
  const tools = TL.filter((x) => (cat === 'All' || x[2] === cat) && matchesQuery(x)).map((x) => ({ name: x[0], desc: x[1], isNew: !!x[3], slug: slugs[x[0]], tile: { background: col[x[2]][1], color: col[x[2]][0] } }));
  const names = ['All', 'Write', 'Plan', 'Grow'];
  const cats = names.map((n) => ({ label: n, on: cat === n, count: TL.filter((x) => (n === 'All' || x[2] === n) && matchesQuery(x)).length, pick: () => setCat(n), style: cat === n ? { background: '#2B1030', color: '#fff', borderColor: '#2B1030' } : { background: '#fff', color: '#2B1030' } }));
  const countText = tools.length + ' of 16 tools' + (cat === 'All' && !q ? '' : ' shown');

  const F = [
    ['Is 3toOne Social free?', 'Yes. You can write captions, hashtags, bios and more for free with no sign-up. Everything runs in your browser.'],
    ['Are the captions written by AI?', 'Our tools draft options from your topic. Always read and edit them before posting so they sound like you.'],
    ['Does it support Hinglish?', 'Yes. You can write in English, Hindi or Hinglish.'],
    ['Will these hashtags guarantee more reach?', 'No tool can guarantee reach. Hashtags help people find relevant posts, but results depend on your content and audience.'],
    ['Will 3toOne Social post for me?', 'No. It never connects to your accounts or posts on your behalf. You copy what you like and post it yourself.'],
    ['What does the content calendar include?', 'A 30-day plan mixing posts, reels and stories, with festival posts placed on the right days.'],
    ['Can agencies manage several brands?', 'These tools work one creator at a time; team accounts are not included.'],
    ['What is 3toOne?', '3toOne is the company behind 3toOne Social and a growing family of tools for PDFs, images, calculators, QR codes and more, all with one account.']
  ];
  const faqs = F.map((f, i) => ({ q: f[0], a: f[1], open: open === i, sign: open === i ? '−' : '+', pick: () => setOpen(open === i ? -1 : i) }));

  return (
    <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', color: '#2B1030' }}>
      {/* Hero */}
      <section id="top" style={{ padding: '56px clamp(20px,5vw,72px) 72px', background: '#FFEFF7' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 56, alignItems: 'center' }}>
          <div style={{ flex: '1 1 440px', minWidth: 0 }}>
            <div style={{ display: 'inline-block', padding: '6px 14px', background: '#fff', border: '1px solid #F0BFD8', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#BE185D' }}>16 creator tools</div>
            <h1 style={{ margin: '18px 0 16px', fontSize: 'clamp(38px,5.2vw,62px)', lineHeight: 1.04, letterSpacing: '-2px', fontWeight: 800 }}>Grow faster on <span style={{ color: '#BE185D' }}>Instagram and YouTube.</span></h1>
            <p style={{ margin: '0 0 28px', fontSize: 18, lineHeight: 1.6, color: '#6B4A66', maxWidth: 520 }}>Captions, hashtags, bios, reel ideas and a full content calendar. Made for Indian creators and small businesses.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a href="#studio" style={{ padding: '16px 28px', background: '#BE185D', color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 16 }}>Write a caption</a>
              <a href="#calendar" style={{ padding: '16px 28px', background: '#fff', border: '2px solid #BE185D', color: '#BE185D', borderRadius: 12, fontWeight: 600, fontSize: 16 }}>See the calendar</a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 26px', marginTop: 30, fontSize: 14, fontWeight: 500, color: '#4A2C46' }}>
              <span>No sign-up for basic tools</span><span>Hinglish supported</span><span>Festival-ready</span>
            </div>
          </div>
          <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400, padding: '0 12px' }}>
              <div style={{ background: '#fff', border: '1px solid #F0BFD8', borderRadius: 28, padding: 16, boxShadow: '0 26px 56px rgba(190,24,93,0.22)', transform: 'rotate(-2deg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#BE185D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>S</span>
                  <div style={{ lineHeight: 1.2 }}><div style={{ fontWeight: 600, fontSize: 14 }}>[your.brand]</div><div style={{ fontSize: 12, color: '#6B4A66' }}>Sponsored sample</div></div>
                </div>
                <div style={{ height: 200, borderRadius: 16, background: '#FBCFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 16 }}><span style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.1, color: '#831843' }}>[Your big news here]</span></div>
                <div style={{ display: 'flex', gap: 14, margin: '12px 0 8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B1030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B1030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" /></svg>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>[your.brand]</b> Soft light, slow days and something new on the way. Save this for later.</div>
                <div style={{ fontSize: 13, color: '#BE185D', marginTop: 6, fontWeight: 500 }}>#newlaunch #smallbusiness #creators</div>
              </div>
              <div style={{ position: 'absolute', right: -6, top: 26, padding: '10px 16px', background: '#FACC15', color: '#2B1030', borderRadius: 14, fontWeight: 700, fontSize: 13, transform: 'rotate(5deg)', boxShadow: '0 10px 24px rgba(43,16,48,0.18)' }}>Hashtags ready</div>
              <div style={{ position: 'absolute', left: -4, bottom: 62, padding: '10px 16px', background: '#fff', border: '1px solid #F0BFD8', borderRadius: 14, fontWeight: 600, fontSize: 13, transform: 'rotate(-4deg)', boxShadow: '0 10px 24px rgba(190,24,93,0.16)' }}>30-day calendar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section style={{ padding: '26px clamp(20px,5vw,72px)', borderBottom: '1px solid #F3D5E6' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '16px 48px', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: '#4A2C46' }}>
          <span>Free to start, no sign-up</span><span>Hindi and Hinglish friendly</span><span>Festival calendar built in</span><span>Never posts on your behalf</span>
        </div>
      </section>

      {/* Caption studio */}
      <section id="studio" style={{ padding: '72px clamp(20px,5vw,72px)', background: '#fff' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BE185D', letterSpacing: '1.2px' }}>CAPTION STUDIO</div>
            <h2 style={{ margin: '8px 0 10px', fontSize: 36, letterSpacing: '-1px' }}>Write a caption in ten seconds</h2>
            <p style={{ margin: 0, color: '#6B4A66', fontSize: 16, lineHeight: 1.6, maxWidth: 600 }}>Tell us what the post is about, pick a vibe and an occasion. You get captions and hashtags to start from.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', border: '1px solid #F3D5E6', borderRadius: 26, overflow: 'hidden', boxShadow: '0 18px 44px rgba(190,24,93,0.1)' }}>
            <div style={{ flex: '1 1 380px', minWidth: 0, padding: 32, display: 'flex', flexDirection: 'column', gap: 22, background: '#FFF7FB' }}>
              <div>
                <label htmlFor="topic" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What is your post about?</label>
                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="For example: our new cafe opening" style={{ width: '100%', boxSizing: 'border-box', padding: '15px 16px', fontSize: 15.5, fontFamily: 'inherit', color: '#2B1030', border: '1.5px solid #E5BDD3', borderRadius: 12, background: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Pick a vibe</div>
                <div role="group" aria-label="Vibe" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {vibes.map((x) => (
                    <button key={x.label} onClick={x.pick} aria-pressed={x.on} style={{ padding: '10px 16px', borderRadius: 99, fontSize: 14, fontWeight: 600, border: '1px solid #E5BDD3', cursor: 'pointer', ...x.style }}>{x.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Pick an occasion</div>
                <div role="group" aria-label="Occasion" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {occasions.map((x) => (
                    <button key={x.label} onClick={x.pick} aria-pressed={x.on} style={{ padding: '10px 16px', borderRadius: 99, fontSize: 14, fontWeight: 600, border: '1px solid #E5BDD3', cursor: 'pointer', ...x.style }}>{x.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: '#6B4A66', lineHeight: 1.5 }}>Sample preview. The full tool writes fresh options each time. Always review before you post.</div>
            </div>
            <div style={{ flex: '1.2 1 420px', minWidth: 0, padding: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#BE185D', letterSpacing: 1 }}>YOUR CAPTIONS</div>
              {captions.map((c, i) => (
                <div key={i} style={{ border: '1px solid #F3D5E6', borderRadius: 16, padding: 18, background: '#fff' }}>
                  <div style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 500 }}>{c.text}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: 12.5, color: '#6B4A66' }}>{c.count} characters</span>
                    <button onClick={() => navigator.clipboard.writeText(c.text)} style={{ padding: '8px 16px', background: '#FDE7F2', color: '#BE185D', border: 0, borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Copy</button>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#BE185D', letterSpacing: 1, marginTop: 6 }}>HASHTAGS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tags.map((t) => <span key={t} style={{ padding: '7px 13px', background: '#FFEFF7', borderRadius: 99, fontSize: 13.5, fontWeight: 500, color: '#9D174D' }}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section id="calendar" style={{ padding: '72px clamp(20px,5vw,72px)', background: '#FFEFF7' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BE185D', letterSpacing: '1.2px' }}>CONTENT CALENDAR</div>
            <h2 style={{ margin: '10px 0 14px', fontSize: 38, lineHeight: 1.1, letterSpacing: '-1.2px' }}>A month of posts, planned in a minute</h2>
            <p style={{ margin: '0 0 22px', color: '#6B4A66', fontSize: 17, lineHeight: 1.65 }}>Tell us your niche. Get a 30-day plan that mixes posts, reels and stories, with festival posts placed where they matter.</p>
            <ul style={{ margin: '0 0 26px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 16 }}>
              {['Niche-specific ideas for every day', 'Indian festival planner', 'Hooks for the first three seconds of a reel', 'Best time to post for your audience'].map((li) => (
                <li key={li} style={{ display: 'flex', gap: 10 }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>{li}</li>
              ))}
            </ul>
            <Link to="/content-calendar" style={{ display: 'inline-block', padding: '15px 28px', background: '#BE185D', color: '#fff', borderRadius: 12, fontWeight: 600 }}>Try the content calendar</Link>
          </div>
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <div style={{ background: '#fff', border: '1px solid #F0BFD8', borderRadius: 24, padding: 22, boxShadow: '0 20px 44px rgba(190,24,93,0.16)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Your 30-day plan</span>
                <span style={{ padding: '4px 11px', background: '#FFEFF7', color: '#BE185D', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>Sample calendar</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6, fontSize: 11.5, fontWeight: 600, color: '#6B4A66', textAlign: 'center' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
                {days.map((d) => (
                  <div key={d.n} style={{ borderRadius: 10, padding: '6px 4px', minHeight: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, ...d.style }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{d.n}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600 }}>{d.type}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, fontSize: 12, fontWeight: 500, color: '#4A2C46' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 12, height: 12, borderRadius: 4, background: '#FBCFE8' }} />Post</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 12, height: 12, borderRadius: 4, background: '#DDD6FE' }} />Reel</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 12, height: 12, borderRadius: 4, background: '#FDE68A' }} />Story</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 12, height: 12, borderRadius: 4, background: '#BBF7D0' }} />Festival</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" style={{ padding: '72px clamp(20px,5vw,72px)', background: '#fff' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BE185D', letterSpacing: '1.2px' }}>ALL TOOLS</div>
            <h2 style={{ margin: '8px 0 8px', fontSize: 36, letterSpacing: '-1px' }}>Every creator tool in one place</h2>
            <p style={{ margin: 0, color: '#6B4A66', fontSize: 16 }}>{countText}</p>
          </div>
          <input type="search" placeholder="Find a tool" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Find a tool" style={{ width: '100%', maxWidth: 420, padding: '12px 16px', borderRadius: 12, border: '1px solid #F3D5E6', fontSize: 15, marginBottom: 16, background: '#fff', color: '#2B1030' }} />
          <div role="group" aria-label="Filter tools by category" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {cats.map((c) => (
              <button key={c.label} onClick={c.pick} aria-pressed={c.on} style={{ padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: '1px solid #E5BDD3', cursor: 'pointer', ...c.style }}>
                {c.label} ({c.count})
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 16 }}>
            {tools.map((t) => (
              <Link key={t.slug} to={`/${t.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 18, border: '1px solid #F3D5E6', borderRadius: 16, background: '#fff', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', ...t.tile }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" /></svg>
                  </span>
                  {t.isNew && <span style={{ padding: '3px 9px', background: '#FACC15', color: '#2B1030', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>New</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{t.name}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6B4A66' }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" style={{ padding: '72px clamp(20px,5vw,72px)', background: '#FFF7FB' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BE185D', letterSpacing: '1.2px' }}>WHY 3TOONE SOCIAL</div>
            <h2 style={{ margin: '8px 0 0', fontSize: 36, letterSpacing: '-1px' }}>Built for how Indian creators post</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {[
              ['Hinglish first', 'Captions that sound like you talk, in English, Hindi or a mix of both.'],
              ['Festival-ready', 'Plan posts around Indian festivals and occasions before the rush starts.'],
              ['Niche-specific ideas', 'Reel and post ideas for gyms, food, fashion, coaching, real estate and more.'],
              ['You stay in control', '3toOne Social drafts ideas. It never connects to or posts on your accounts.']
            ].map(([h, p]) => (
              <div key={h} style={{ background: '#fff', border: '1px solid #F3D5E6', padding: 24, borderRadius: 18 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{h}</h3>
                <p style={{ margin: 0, color: '#6B4A66', lineHeight: 1.6, fontSize: 15 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '72px clamp(20px,5vw,72px)', background: '#FFF7FB' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 48 }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BE185D', letterSpacing: '1.2px' }}>FAQ</div>
            <h2 style={{ margin: '8px 0 12px', fontSize: 36, letterSpacing: '-1px' }}>Questions, answered</h2>
            <p style={{ margin: '0 0 20px', color: '#6B4A66', lineHeight: 1.6 }}>Cannot find what you need? We reply within one working day.</p>
            <span style={{ display: 'inline-block', padding: '12px 22px', border: '1.5px solid #BE185D', color: '#BE185D', borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Contact support</span>
          </div>
          <div style={{ flex: '2 1 440px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((f, i) => (
              <div key={f.q} style={{ background: '#fff', border: '1px solid #F3D5E6', borderRadius: 14 }}>
                <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={f.open} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'none', border: 0, textAlign: 'left', color: '#2B1030', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                  <span>{f.q}</span>
                  <span style={{ color: '#BE185D', fontSize: 24 }} aria-hidden="true">{f.sign}</span>
                </button>
                {f.open && <p style={{ margin: 0, padding: '0 20px 20px', color: '#6B4A66', lineHeight: 1.65, fontSize: 15 }}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px clamp(20px,5vw,72px)', background: '#BE185D', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 36, letterSpacing: '-1px' }}>Stuck on what to post? Start here.</h2>
        <p style={{ margin: '0 0 24px', fontSize: 17, opacity: 0.96 }}>Free tools, no sign-up. Everything runs in your browser.</p>
        <a href="#studio" style={{ display: 'inline-block', padding: '15px 30px', background: '#fff', color: '#BE185D', borderRadius: 12, fontWeight: 700 }}>Write a caption</a>
      </section>
    </div>
  );
}
