export default function handler(req, res) {
  // Only allow same-origin requests (or add your domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    covalent: process.env.COVALENT_KEY || '',
    zerion: process.env.ZERION_KEY || ''
  });
}
