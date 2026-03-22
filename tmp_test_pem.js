const key = `"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDv4p7z4BiOYoZD\n6MdnHj4LvjJuLxeErbb/2xBu0ofK8gUGBZTfJrAqoVztCKfz0vBSSF2LNzrBG76u\nahxS/5dz2vJ1oM3gYVAX6bx71FYj4Fl226BF0lw9KFgwJ3p9HLORGFSkUyYaXc3N\n+lZoJJ1QWAN5kUPLZNWTS7lsylwb/cjK+kUmq5eJDEmiAXlcaPWlhkU/coWdXmq5\nQeTkKE6H+zqmEWIM44GF3u/ifjIXInwZud4v6VBo+OdXyEIJBcnFp4VEu32Zew9l\nhA5Nnwx+/hq9XqryJndLeKCVl/wbEgzA+9A07icxc5X/WuJUSYzsFI+I+/SSFq/O\nPsaM+vK5AgMBAAECggEAZibXEXsoedmy21BRObRDL7T6vLkJBtMCzsl2ofq9IMsX\nII1X6/8Jnd3BOJ8rBkWZWTC/xPzr5DfwZ02Aake1MvzVqwmjIh3OgaBjR0gQto5f\nCqJUCeeep9x6UWc+XfDO9sappKBT5X50mXY1PXv6EbCpKieV+xMhb+wbNhymRLRm\noynI8V4+kVRQwe6Cw1LimN286VKN8J3tflKqy5Jlw0uhHnWu2Dbo1gEPHn1LcejG\niRa8J9xse9P2khzFerhms3ZAjdLUl1N/WneKGZdxIBbBmxCNxxnFdzg69AeF+l6J\nF51zTTbLgBfI8qYiwR0IsjzCOSSI39zWka5ZNaxV0QKBgQD9yB9ZYTEGpfTm/dXS\nkpRZnFxwa9meYwYzXc9YyGDuopDh5GeWOacboYi05V9Ilyo14/ds+2ZarV9sX/Ss\nFc+wO6+LAdcpq/spZz6StQGB/L0pm+plG/fkAawmezWkR9tzIvQlKL6VK2JarKkq\neTbsebeIHTQWgblm3fHmER4MnwKBgQDx+2cevo0rXT/M/aHd4gg3r3wwRYfiifep\nBtWRl35Fm/H+QUCWmrbUXPZ0O35LJQIj7C4x9gURB4LbJ8n551eyU1y7z5MbOAUt\nAstwps0RplKvb3EJQueI0myUs86tFHJptuulOc+5cOvCeVbbH6brThkuaDumGuEY\nz/dbqJzppwKBgEUMOPNRjUw4xQxADfgv52sGLuRrg5cjbCF3qZ2HT1A+LNs5ELH/\n16ad6ZsGOUl/z31AHCars+qB909+QAy+Fnblllpk0szEvR5Dt/Okidd7E2CJylle\nJbEEf3ks1qhu4JdP8EtX7ZqaZjUzewdSWY43g6bmAzEIdJA3XMRy7dETAoGBAO0v\njT5XbKwqtNTLbxO78G4Utlfib3Uf4v9s0X3pzj2Qw7yCXTrB3598l54KippBZj2r\nzQPvr7unbx49e/5WQmFq0KTOq9SsLnaWHK8I8EzyiG2pgFShna1BBGklbdm9BwCT\n6ZqEdhXAl3aB1R7ngYd3f7s7M+x2wFi/0CepuFRVAoGBAOl3/W4sNWSOvigLOb9M\nLxZuYUu6tJjhWyw/U8zSkvmyUrcf44F1yY4nB5C0ptMXdxvi1Vq+aEyobOLDuGfs\nAlCQgvG3fwmj9R8RgMNhFb7MwY7dBlPmep7hY4Cjvke1kOqRy+bZGuHPXCYdzhbY\nxas+9ludcodf51KKuox75way\n-----END PRIVATE KEY-----\n"`;

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  
  let formatted = key;
  try {
    const parsed = JSON.parse(key);
    if (parsed.private_key) {
      formatted = parsed.private_key;
    }
  } catch (e) {
  }

  formatted = formatted.replace(/\\n/g, "\n").replace(/"/g, '').trim(); 
  
  if (formatted.includes('BEGIN PRIVATE KEY') && formatted.includes('END PRIVATE KEY')) {
    const base64Payload = formatted
      .split('BEGIN PRIVATE KEY-----')[1]
      .split('-----END PRIVATE KEY')[0]
      .replace(/\s+/g, ''); 
      
    const chunks = base64Payload.match(/.{1,64}/g) || [];
    formatted = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }
  
  return formatted;
};

const crypto = require('crypto');
try {
  const p = formatPrivateKey(key);
  console.log("FINAL PEM STRING:");
  console.log(p.substring(0, 100) + '...');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update('test payload');
  sign.sign(p, 'base64');
  
  console.log('SUCCESS! Node.js crypto accepted the format!');
} catch (e) {
  console.log('FAILED!', e.message);
}
