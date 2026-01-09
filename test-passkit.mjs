import 'dotenv/config';

const PASSKIT_BASE_URL = process.env.PASSKIT_BASE_URL || 'https://api.pub1.passkit.io';
const PASSKIT_API_KEY = process.env.PASSKIT_API_KEY;
const PASSKIT_API_SECRET = process.env.PASSKIT_API_SECRET;
const PASSKIT_PROGRAM_ID = process.env.PASSKIT_PROGRAM_ID;

console.log('🔍 PassKit Konfiqurasiya Yoxlaması\n');
console.log('PASSKIT_BASE_URL:', PASSKIT_BASE_URL);
console.log('PASSKIT_API_KEY:', PASSKIT_API_KEY ? '✅ Mövcuddur' : '❌ Mövcud deyil');
console.log('PASSKIT_API_SECRET:', PASSKIT_API_SECRET ? '✅ Mövcuddur' : '❌ Mövcud deyil');
console.log('PASSKIT_PROGRAM_ID:', PASSKIT_PROGRAM_ID || '❌ Mövcud deyil');
console.log('');

if (!PASSKIT_API_KEY || !PASSKIT_API_SECRET || !PASSKIT_PROGRAM_ID) {
  console.error('❌ PassKit açarları konfiqurasiya edilməyib!');
  process.exit(1);
}

// Test PassKit API connection
async function testPassKitConnection() {
  try {
    console.log('📡 PassKit API əlaqəsi test edilir...\n');
    
    const auth = Buffer.from(`${PASSKIT_API_KEY}:${PASSKIT_API_SECRET}`).toString('base64');
    
    // Test program details
    const programResponse = await fetch(
      `${PASSKIT_BASE_URL}/loyalty/program/${PASSKIT_PROGRAM_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!programResponse.ok) {
      const errorText = await programResponse.text();
      console.error('❌ Program məlumatları alına bilmədi:');
      console.error('Status:', programResponse.status);
      console.error('Response:', errorText);
      return false;
    }

    const programData = await programResponse.json();
    console.log('✅ PassKit Program məlumatları:');
    console.log('  Program ID:', programData.id);
    console.log('  Program Adı:', programData.name || 'N/A');
    console.log('  Status:', programData.status || 'N/A');
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ PassKit API xətası:', error.message);
    return false;
  }
}

// Test creating a member
async function testCreateMember() {
  try {
    console.log('👤 Test üzvü yaradılır...\n');
    
    const auth = Buffer.from(`${PASSKIT_API_KEY}:${PASSKIT_API_SECRET}`).toString('base64');
    
    const testMember = {
      programId: PASSKIT_PROGRAM_ID,
      person: {
        displayName: 'Test İstifadəçi',
        emailAddress: 'test@coffeelin.az',
      },
      externalId: `test-${Date.now()}`,
      points: 100,
      tier: {
        id: 'silver',
        name: 'Silver',
      },
    };

    const response = await fetch(
      `${PASSKIT_BASE_URL}/loyalty/member`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMember),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Üzv yaradıla bilmədi:');
      console.error('Status:', response.status);
      console.error('Response:', errorText);
      return false;
    }

    const memberData = await response.json();
    console.log('✅ Test üzvü uğurla yaradıldı:');
    console.log('  Member ID:', memberData.id);
    console.log('  External ID:', memberData.externalId);
    console.log('  Points:', memberData.points);
    console.log('  Pass URL:', memberData.url || 'N/A');
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ Üzv yaratma xətası:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('Coffee Lin - PassKit İnteqrasiya Testi');
  console.log('='.repeat(60));
  console.log('');

  const connectionOk = await testPassKitConnection();
  
  if (connectionOk) {
    await testCreateMember();
  }

  console.log('='.repeat(60));
  console.log('Test tamamlandı');
  console.log('='.repeat(60));
}

runTests();
