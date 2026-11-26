import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

const copyText = async (text) => { try { await navigator.clipboard.writeText(text); alert('Copied'); } catch {} };

const TA = ({ value, onChange, placeholder, rows = 6, readOnly = false }) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E5BDD3', fontFamily: 'inherit', background: readOnly ? '#FFF7FB' : '#fff' }} />
);

const Input = (props) => <input {...props} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E5BDD3', fontFamily: 'inherit', ...(props.style || {}) }} />;

const Btn = ({ children, onClick, primary }) => (
  <button onClick={onClick} style={{ padding: '10px 16px', borderRadius: 10, border: primary ? 0 : '1px solid #E5BDD3', background: primary ? '#BE185D' : '#fff', color: primary ? '#fff' : '#2B1030', fontWeight: 600, cursor: 'pointer', margin: 4 }}>{children}</button>
);

function CaptionGenerator() {
  const [topic, setTopic] = useState('our new cafe opening');
  const [vibe, setVibe] = useState(0);
  const [occ, setOcc] = useState(0);
  const V = [
    ['Fun', ['Plot twist: ' + topic + '. And yes, we are a little obsessed.', topic.charAt(0).toUpperCase() + topic.slice(1) + ' is happening and we cannot keep calm.', 'Tag someone who needs to see ' + topic + ' right now.'], ['#funtimes', '#vibes']],
    ['Aesthetic', ['Soft light, slow days, ' + topic + '.', topic.charAt(0).toUpperCase() + topic.slice(1) + '. Quietly beautiful.', 'Collecting little moments like ' + topic + '.'], ['#aesthetic', '#softlife']],
    ['Motivational', ['Small steps lead to big things: ' + topic + '.', 'Start before you feel ready. Today it is ' + topic + '.', topic.charAt(0).toUpperCase() + topic.slice(1) + ': proof that showing up works.'], ['#motivation', '#keepgoing']],
    ['Professional', ['Excited to share: ' + topic + '. Details in the comments.', 'Introducing ' + topic + '. Built with care for you.', 'Big news from our team: ' + topic + '.'], ['#smallbusiness', '#announcement']]
  ];
  const O = [['Any', ''], ['Festival', ' Wishing you a bright and happy festival season.'], ['Birthday', ' Cake, candles and good company.'], ['Travel', ' The journey is the best part.'], ['Food', ' Come hungry.'], ['Fitness', ' Stronger every day.'], ['Shop launch', ' Open now. Visit us today.']];
  const v = V[vibe], o = O[occ];
  const captions = v[1].map((c) => c + o[1]);
  const words = topic.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3).slice(0, 3).map((w) => '#' + w);
  const tags = Array.from(new Set(words.concat(v[2], ['#instagood', '#reels']))).slice(0, 9);
  return (
    <div>
      <label>What is your post about?</label>
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="For example: our new cafe opening" />
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Pick a vibe</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {V.map((x, i) => <Btn key={x[0]} onClick={() => setVibe(i)} primary={vibe === i}>{x[0]}</Btn>)}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Pick an occasion</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {O.map((x, i) => <Btn key={x[0]} onClick={() => setOcc(i)} primary={occ === i}>{x[0]}</Btn>)}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, color: '#BE185D', marginBottom: 8 }}>YOUR CAPTIONS</div>
        {captions.map((c, i) => (
          <div key={i} style={{ border: '1px solid #F3D5E6', borderRadius: 12, padding: 14, marginBottom: 10, background: '#fff' }}>
            <div style={{ fontSize: 16, lineHeight: 1.55 }}>{c}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#6B4A66' }}>
              <span>{c.length} characters</span>
              <Btn onClick={() => copyText(c)}>Copy</Btn>
            </div>
          </div>
        ))}
        <div style={{ fontWeight: 700, color: '#BE185D', margin: '12px 0 6px' }}>HASHTAGS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.map((t) => <span key={t} style={{ padding: '6px 12px', background: '#FFEFF7', borderRadius: 999, fontSize: 13, color: '#9D174D' }}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function BioGenerator() {
  const [niche, setNiche] = useState('fitness coach');
  const [keywords, setKeywords] = useState('workouts, nutrition, online coaching');
  const [platform, setPlatform] = useState('Instagram');
  const bios = useMemo(() => {
    const k = keywords.split(',').map((s) => s.trim()).filter(Boolean);
    const base = [
      `${niche} | ${k.join(' • ')}\nHelping you get stronger every day.\n👇 Start here`,
      `Certified ${niche}. ${k[0] || ''} tips daily.\nDM "COACH" to begin.`,
      `${niche.toUpperCase()} • ${k.slice(0, 2).join(' & ')}\nTransforming lives, one rep at a time.`
    ];
    if (platform === 'LinkedIn') return base.map((b) => b + '\n\nOpen to collaborations.');
    if (platform === 'WhatsApp') return base.map((b) => b.replace(/\n/g, ' | '));
    return base;
  }, [niche, keywords, platform]);
  return (
    <div>
      <label>Niche</label><Input value={niche} onChange={(e) => setNiche(e.target.value)} />
      <label style={{ marginTop: 8, display: 'block' }}>Keywords (comma separated)</label><Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        {['Instagram', 'LinkedIn', 'WhatsApp'].map((p) => <Btn key={p} onClick={() => setPlatform(p)} primary={platform === p}>{p}</Btn>)}
      </div>
      <div style={{ marginTop: 16 }}>
        {bios.map((b, i) => (
          <div key={i} style={{ border: '1px solid #F3D5E6', borderRadius: 12, padding: 14, marginBottom: 10, whiteSpace: 'pre-wrap' }}>
            {b}
            <div style={{ marginTop: 8 }}><Btn onClick={() => copyText(b)}>Copy</Btn></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TweetGenerator() {
  const [topic, setTopic] = useState('launching our new product');
  const [tone, setTone] = useState('Casual');
  const tweets = useMemo(() => {
    const T = topic.charAt(0).toUpperCase() + topic.slice(1);
    const map = {
      Casual: [`${T} and I am so excited.`, `Big day: ${topic}. Who is in?`, `Hot take: ${topic} is going to be huge.`],
      Professional: [`We are pleased to announce ${topic}.`, `Excited to share an update: ${topic}.`, `Introducing ${topic} — built with care.`],
      Witty: [`Plot twist: ${topic}.`, `${T}. Yes, really.`, `If you are not talking about ${topic}, what are you doing?`]
    };
    return map[tone];
  }, [topic, tone]);
  const thread = tweets.map((t, i) => `${i + 1}/ ${t}`).join('\n');
  return (
    <div>
      <label>Topic</label><Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        {['Casual', 'Professional', 'Witty'].map((t) => <Btn key={t} onClick={() => setTone(t)} primary={tone === t}>{t}</Btn>)}
      </div>
      <div style={{ marginTop: 16 }}>
        {tweets.map((t, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6 }}>{t} <Btn onClick={() => copyText(t)}>Copy</Btn></div>)}
        <div style={{ marginTop: 10 }}><Btn onClick={() => copyText(thread)} primary>Copy as thread</Btn></div>
      </div>
    </div>
  );
}

function CommentReply() {
  const [comment, setComment] = useState('Love this!');
  const [tone, setTone] = useState('Friendly');
  const replies = useMemo(() => {
    const base = {
      Friendly: ['Thank you so much! 💛', 'So glad you liked it!', 'Appreciate the love!'],
      Professional: ['Thank you for your feedback.', 'We appreciate your support.', 'Glad to hear this resonated.'],
      Witty: ['Right back at you! 😉', 'We try. 😎', 'You made our day!']
    }[tone];
    return base.map((r) => r + (comment ? ` (re: "${comment.slice(0, 30)}")` : ''));
  }, [comment, tone]);
  return (
    <div>
      <label>Comment</label><TA value={comment} onChange={setComment} rows={3} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        {['Friendly', 'Professional', 'Witty'].map((t) => <Btn key={t} onClick={() => setTone(t)} primary={tone === t}>{t}</Btn>)}
      </div>
      <div style={{ marginTop: 16 }}>
        {replies.map((r, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6 }}>{r} <Btn onClick={() => copyText(r)}>Copy</Btn></div>)}
      </div>
    </div>
  );
}

function ReelHook() {
  const [topic, setTopic] = useState('morning routine');
  const [style, setStyle] = useState('Curiosity');
  const hooks = useMemo(() => {
    const T = topic;
    const styles = {
      Curiosity: [`You are doing ${T} wrong.`, `Nobody talks about ${T} like this.`, `Wait for the end of this ${T} tip.`],
      Shock: [`Stop ${T} immediately.`, `This ${T} mistake is costing you.`, `${T} changed everything for me.`],
      Story: [`I almost quit ${T}.`, `Here is how ${T} saved my day.`, `My ${T} journey in 30 seconds.`]
    };
    return styles[style];
  }, [topic, style]);
  return (
    <div>
      <label>Topic</label><Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        {['Curiosity', 'Shock', 'Story'].map((s) => <Btn key={s} onClick={() => setStyle(s)} primary={style === s}>{s}</Btn>)}
      </div>
      <div style={{ marginTop: 16 }}>
        {hooks.map((h, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6, fontWeight: 600 }}>{h} <Btn onClick={() => copyText(h)}>Copy</Btn></div>)}
      </div>
    </div>
  );
}

function ContentCalendar() {
  const [niche, setNiche] = useState('food');
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const types = ['Post', 'Reel', 'Story'];
    const type = (i === 11 || i === 24) ? 'Festival' : types[(i * 3 + Math.floor(i / 7)) % 3];
    return { n: i + 1, type, idea: `${type} idea for ${niche} on day ${i + 1}` };
  }), [niche]);
  return (
    <div>
      <label>Niche</label><Input value={niche} onChange={(e) => setNiche(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginTop: 16 }}>
        {days.map((d) => (
          <div key={d.n} style={{ border: '1px solid #F3D5E6', borderRadius: 8, padding: 6, minHeight: 52, textAlign: 'center', background: d.type === 'Festival' ? '#BBF7D0' : d.type === 'Reel' ? '#DDD6FE' : d.type === 'Story' ? '#FDE68A' : '#FBCFE8' }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{d.n}</div>
            <div style={{ fontSize: 10 }}>{d.type}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}><Btn onClick={() => copyText(days.map((d) => `Day ${d.n}: ${d.type} - ${d.idea}`).join('\n'))} primary>Copy plan</Btn></div>
    </div>
  );
}

function FestivalPlanner() {
  const [festival, setFestival] = useState('Diwali');
  const ideas = useMemo(() => [
    `Wishing everyone a happy ${festival}! Share your celebrations.`,
    `${festival} special offer: 20% off for 3 days.`,
    `Behind the scenes: how we prepare for ${festival}.`,
    `User spotlight: your ${festival} stories.`
  ], [festival]);
  return (
    <div>
      <label>Festival / occasion</label><Input value={festival} onChange={(e) => setFestival(e.target.value)} />
      <div style={{ marginTop: 16 }}>
        {ideas.map((idea, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6 }}>{idea} <Btn onClick={() => copyText(idea)}>Copy</Btn></div>)}
      </div>
    </div>
  );
}

function PostIdeas() {
  const [niche, setNiche] = useState('gym');
  const ideas = useMemo(() => [
    `5 mistakes every ${niche} beginner makes`,
    `Day in the life of a ${niche} owner`,
    `Before/after: ${niche} transformation`,
    `Top tools I use for ${niche}`,
    `Q&A: ask me anything about ${niche}`
  ], [niche]);
  return (
    <div>
      <label>Niche</label><Input value={niche} onChange={(e) => setNiche(e.target.value)} />
      <div style={{ marginTop: 16 }}>
        {ideas.map((idea, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6 }}>{idea} <Btn onClick={() => copyText(idea)}>Copy</Btn></div>)}
      </div>
    </div>
  );
}

function ReelIdeas() {
  const [niche, setNiche] = useState('food');
  const ideas = useMemo(() => [
    `Quick ${niche} recipe in 15 seconds`,
    `${niche} hack you did not know`,
    `POV: running a ${niche} business`,
    `${niche} fails that made me better`,
    `Trending audio + ${niche} content`
  ], [niche]);
  return (
    <div>
      <label>Niche</label><Input value={niche} onChange={(e) => setNiche(e.target.value)} />
      <div style={{ marginTop: 16 }}>
        {ideas.map((idea, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6 }}>{idea} <Btn onClick={() => copyText(idea)}>Copy</Btn></div>)}
      </div>
    </div>
  );
}

function BestTime() {
  const [platform, setPlatform] = useState('Instagram');
  const [audience, setAudience] = useState('India');
  const times = useMemo(() => {
    const base = {
      Instagram: ['7-9 AM', '12-1 PM', '7-9 PM'],
      YouTube: ['2-4 PM (upload)', '6-8 PM (publish)', 'Weekends 10 AM'],
      LinkedIn: ['8-10 AM', '12 PM', '5-6 PM']
    }[platform];
    return base.map((t) => `${t} (${audience})`);
  }, [platform, audience]);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Instagram', 'YouTube', 'LinkedIn'].map((p) => <Btn key={p} onClick={() => setPlatform(p)} primary={platform === p}>{p}</Btn>)}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['India', 'Global', 'US'].map((a) => <Btn key={a} onClick={() => setAudience(a)} primary={audience === a}>{a}</Btn>)}
      </div>
      <ul style={{ marginTop: 16 }}>{times.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function HashtagGenerator() {
  const [topic, setTopic] = useState('cafe');
  const [platform, setPlatform] = useState('Instagram');
  const tags = useMemo(() => {
    const base = topic.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const tags = base.map((w) => '#' + w);
    const extras = { Instagram: ['#instagood', '#reels', '#explore'], YouTube: ['#shorts', '#youtubetips', '#subscribe'], LinkedIn: ['#linkedin', '#networking', '#career'] }[platform];
    return Array.from(new Set(tags.concat(extras))).slice(0, 12);
  }, [topic, platform]);
  return (
    <div>
      <label>Topic</label><Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        {['Instagram', 'YouTube', 'LinkedIn'].map((p) => <Btn key={p} onClick={() => setPlatform(p)} primary={platform === p}>{p}</Btn>)}
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((t) => <span key={t} style={{ padding: '6px 12px', background: '#FFEFF7', borderRadius: 999, fontSize: 13, color: '#9D174D' }}>{t}</span>)}
      </div>
      <div style={{ marginTop: 12 }}><Btn onClick={() => copyText(tags.join(' '))} primary>Copy all</Btn></div>
    </div>
  );
}

function YTTitle() {
  const [topic, setTopic] = useState('budget travel');
  const [style, setStyle] = useState('How-to');
  const titles = useMemo(() => {
    const T = topic.charAt(0).toUpperCase() + topic.slice(1);
    const styles = {
      'How-to': [`How to ${topic} (step by step)`, `${T}: complete guide for beginners`, `How I ${topic} in 2026`],
      Listicle: [`Top 10 ${topic} tips`, `7 ${topic} mistakes to avoid`, `5 best ${topic} ideas`],
      Question: [`Is ${topic} worth it?`, `What nobody tells you about ${topic}`, `Can you ${topic} on a budget?`]
    };
    return styles[style];
  }, [topic, style]);
  return (
    <div>
      <label>Topic</label><Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        {['How-to', 'Listicle', 'Question'].map((s) => <Btn key={s} onClick={() => setStyle(s)} primary={style === s}>{s}</Btn>)}
      </div>
      <div style={{ marginTop: 16 }}>
        {titles.map((t, i) => <div key={i} style={{ padding: 10, border: '1px solid #F3D5E6', borderRadius: 8, marginBottom: 6 }}>{t} <Btn onClick={() => copyText(t)}>Copy</Btn></div>)}
      </div>
    </div>
  );
}

function YTDescription() {
  const [topic, setTopic] = useState('budget travel');
  const desc = useMemo(() => `In this video we explore ${topic}.\n\nChapters:\n0:00 Intro\n1:30 What is ${topic}\n3:00 Tips\n6:00 Outro\n\nSubscribe for more.`, [topic]);
  return (
    <div>
      <label>Topic</label><Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <TA value={desc} onChange={() => {}} readOnly />
      <div style={{ marginTop: 8 }}><Btn onClick={() => copyText(desc)} primary>Copy</Btn></div>
    </div>
  );
}

function YTTags() {
  const [topic, setTopic] = useState('budget travel');
  const tags = useMemo(() => topic.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).concat(['youtube', 'tips', 'guide']).join(', '), [topic]);
  return (
    <div>
      <label>Topic</label><Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <TA value={tags} onChange={() => {}} readOnly />
      <div style={{ marginTop: 8 }}><Btn onClick={() => copyText(tags)} primary>Copy</Btn></div>
    </div>
  );
}

function UsernameGenerator() {
  const [niche, setNiche] = useState('fitness');
  const names = useMemo(() => {
    const n = niche.toLowerCase().replace(/\s+/g, '');
    return [n, `the${n}`, `${n}hub`, `${n}daily`, `get${n}`, `${n}withme`, `my${n}journey`];
  }, [niche]);
  return (
    <div>
      <label>Niche</label><Input value={niche} onChange={(e) => setNiche(e.target.value)} />
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {names.map((n) => <span key={n} style={{ padding: '8px 14px', background: '#FFEFF7', borderRadius: 999, color: '#9D174D' }}>@{n} <Btn onClick={() => copyText('@' + n)}>Copy</Btn></span>)}
      </div>
    </div>
  );
}

function GiveawayPicker() {
  const [list, setList] = useState('Alice\nBob\nCharlie');
  const [winner, setWinner] = useState('');
  const pick = () => {
    const names = list.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!names.length) return;
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    setWinner(names[random[0] % names.length]);
  };
  return (
    <div>
      <label>Names (one per line)</label><TA value={list} onChange={setList} />
      <div style={{ marginTop: 8 }}><Btn onClick={pick} primary>Pick winner</Btn></div>
      {winner && <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700, color: '#BE185D' }}>Winner: {winner} <Btn onClick={() => copyText(winner)}>Copy</Btn></div>}
    </div>
  );
}

const MAP = {
  'instagram-caption-generator': CaptionGenerator,
  'bio-generator': BioGenerator,
  'tweet-generator': TweetGenerator,
  'comment-reply-generator': CommentReply,
  'reel-hook-generator': ReelHook,
  'content-calendar': ContentCalendar,
  'festival-post-planner': FestivalPlanner,
  'post-ideas-generator': PostIdeas,
  'reel-ideas-generator': ReelIdeas,
  'best-time-to-post': BestTime,
  'hashtag-generator': HashtagGenerator,
  'youtube-title-generator': YTTitle,
  'youtube-description-generator': YTDescription,
  'youtube-tag-generator': YTTags,
  'username-generator': UsernameGenerator,
  'giveaway-winner-picker': GiveawayPicker
};

export default function SocialTool() {
  const { slug } = useParams();
  const Comp = MAP[slug];
  if (!Comp) return <div>Tool not available.</div>;
  return <div className="gen-tool"><Comp /></div>;
}
