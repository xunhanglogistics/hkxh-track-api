export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customNumber } = req.body;
  if (!customNumber) {
    return res.status(400).json({ error: '请输入物流单号' });
  }

  const API_KEY = '3FCB20328F52E3B2FE6D492DAAED20B3';

  try {
    const trackRes = await fetch('https://api.17track.net/track/v2/gettrackinfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      },
      body: JSON.stringify({
        data: [{ number: customNumber }]
      })
    });

    const trackData = await trackRes.json();
    
    // 把17TRACK返回的所有信息都返回给前端，方便排查
    return res.status(200).json({
      message: '17TRACK返回详情',
      trackData: trackData
    });

  } catch (error) {
    return res.status(500).json({ error: '查询接口异常', detail: error.message });
  }
}
