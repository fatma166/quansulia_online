// API endpoint للحصول على حقول التوكيل المحددة
export const fetchPOAFields = async (poaType, poaSubtype) => {
  console.log('🚀 Ajax call started for specific fields:', poaType, poaSubtype);
  
  try {
    // Fetch the JSON file
    const response = await fetch('/src/data/poaFields.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('📡 Ajax response received, status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const allData = await response.json();
    console.log('📦 Full JSON data loaded');
    
    // Extract only the specific fields for the requested type
    if (allData[poaType] && allData[poaType][poaSubtype]) {
      const specificData = allData[poaType][poaSubtype];
      console.log('✅ Returning specific fields for', poaSubtype, ':', specificData.fields);
      
      // Return only the fields array as requested
      return specificData.fields || [];
    } else {
      console.log('❌ No fields found for:', poaType, poaSubtype);
      return [];
    }
    
  } catch (error) {
    console.error('💥 Ajax error:', error);
    return [];
  }
};