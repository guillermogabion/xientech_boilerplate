// types/mapping.ts
export interface MappingSuggestion {
  [key: string]: string; // SystemField: UserHeader
}

// bia-mapper.ts
const SYNONYMS: Record<string, string[]> = {
  firstName: ['first name', 'given name', 'fname', 'name', 'unang pangalan'],
  lastName: ['last name', 'surname', 'family name', 'lname', 'apelyido'],
  purokName: ['purok', 'zone', 'sitio', 'district', 'purok/zone'],
  streetName: ['street', 'kalsada', 'st', 'address', 'daan'],
  householdNo: ['household', 'house number', 'hh #', 'hh_no', 'bahay'],
  birthDate: ['birthday', 'birth date', 'dob', 'kapanganakan', 'bdate'],
  gender: ['sex', 'gender', 'kasarian', 'm/f']
};

export const getSmartSuggestions = (userHeaders: string[]): MappingSuggestion => {
  const suggestions: MappingSuggestion = {};

  Object.keys(SYNONYMS).forEach((systemField) => {
    const possibleMatches = SYNONYMS[systemField];
    
    // Find a header that matches any of our synonyms
    const match = userHeaders.find(header => 
      possibleMatches.some(synonym => 
        header.toLowerCase().includes(synonym.toLowerCase())
      )
    );

    if (match) {
      suggestions[systemField] = match;
    }
  });

  return suggestions;
};