const https = require('https');

https.get('https://swan-warehouse-app.pages.dev/kpis', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('HTML length:', data.length);
    
    // Check if new components exist in the HTML
    const hasTrendText = data.includes('วิเคราะห์แนวโน้ม') || data.includes('Trend') || data.includes('editUnit');
    const hasSelectUnit = data.includes('หน่วยนับ');
    
    console.log('Contains "วิเคราะห์แนวโน้ม" or "Trend":', hasTrendText);
    console.log('Contains "หน่วยนับ" (Unit):', hasSelectUnit);
    
    // Print a snippet of the script tags or content
    console.log('HTML snippet:', data.substring(0, 1000));
  });
}).on('error', (e) => {
  console.error('Error fetching page:', e.message);
});
