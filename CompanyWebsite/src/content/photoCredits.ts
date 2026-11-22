import type { PhotoId } from '../lib/photos';

export interface PhotoCredit {
  /** File name on Wikimedia Commons. */
  title: string;
  author: string;
  license: string;
  /** The photo's page on Wikimedia Commons, which holds the full licence text. */
  url: string;
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

/** Every photo is from Wikimedia Commons, cropped to 3:2 and compressed. CC BY and CC BY-SA need this credit shown. */
export const PHOTO_CREDITS: Record<PhotoId, PhotoCredit> = {
  mango: { title: '8708Fruits of Bulacan 12.jpg', author: 'Judgefloro', license: 'CC0', url: commons('8708Fruits of Bulacan 12.jpg') },
  banana: { title: '09016ajfBananas in the Philippinesfvf.jpg', author: 'Judgefloro', license: 'CC0', url: commons('09016ajfBananas in the Philippinesfvf.jpg') },
  pineapple: { title: 'കൈതച്ചക്ക.jpg', author: 'Suniltg at Malayalam Wikipedia', license: 'CC BY 3.0', url: commons('കൈതച്ചക്ക.jpg') },
  tomato: {
    title: 'Fresh Tomatoes, Green Pepper, Red Onion, and English Cucumbers (8737977104).jpg',
    author: 'Geoff Peters from Vancouver, BC, Canada',
    license: 'CC BY 2.0',
    url: commons('Fresh Tomatoes, Green Pepper, Red Onion, and English Cucumbers (8737977104).jpg'),
  },
  eggplant: { title: 'Solanum melongena 24 08 2012 (1).JPG', author: 'Joydeep', license: 'CC BY-SA 3.0', url: commons('Solanum melongena 24 08 2012 (1).JPG') },
  corn: { title: 'Corn on the cob (sweet corn).jpg', author: 'Nutrition, Food Safety & Health', license: 'CC0', url: commons('Corn on the cob (sweet corn).jpg') },
  pechay: { title: 'Brassica rapa var. chinensis (leaf).jpg', author: 'おむこさん志望', license: 'CC BY 2.5', url: commons('Brassica rapa var. chinensis (leaf).jpg') },
  kangkong: { title: 'Harvested - Kangkong (3446711239).jpg', author: 'Alpha from Melbourne, Australia', license: 'CC BY-SA 2.0', url: commons('Harvested - Kangkong (3446711239).jpg') },
  kamote: { title: 'Ipomoea batatas - Tubers.jpg', author: "Filo gèn'", license: 'CC BY-SA 4.0', url: commons('Ipomoea batatas - Tubers.jpg') },
  cassava: { title: 'Malpighiales - Manihot esculenta - 1.jpg', author: 'Emőke Dénes', license: 'CC BY-SA 4.0', url: commons('Malpighiales - Manihot esculenta - 1.jpg') },
  basket: { title: 'Oil extracting betari.jpg', author: 'Rumi Borah~aswiki', license: 'CC BY 4.0', url: commons('Oil extracting betari.jpg') },
  rattan: { title: 'Rattan and Nito.jpg', author: 'Bim24', license: 'CC0', url: commons('Rattan and Nito.jpg') },
};
