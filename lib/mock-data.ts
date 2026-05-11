export type BookStatus = 'available' | 'on-loan' | 'hidden';
export type ConditionType = 'Like New' | 'Great' | 'Good' | 'Acceptable' | 'Well Loved';
export type LoanStatus = 'pending' | 'active' | 'returned' | 'declined';

export interface User {
  id: string;
  name: string;
  initials: string;
  booksShared: number;
  booksBorrowed: number;
  neighborhood: string;
  memberSince: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  condition: ConditionType;
  status: BookStatus;
  owner: { id: string; name: string; initials: string; neighborhood: string };
  neighborhood: string;
  distance: string;
  lat: number;
  lng: number;
  description: string;
  genre: string;
}

export interface Loan {
  id: string;
  book: Book;
  borrower: { id: string; name: string; initials: string };
  lender: { id: string; name: string; initials: string };
  status: LoanStatus;
  startDate: string | null;
  dueDate: string | null;
  returnedDate: string | null;
}

export interface Message {
  id: string;
  loanId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface BorrowRequest {
  id: string;
  book: Book;
  requester: { id: string; name: string; initials: string };
  message: string;
  createdAt: string;
}

export interface ChatThread {
  loanId: string;
  book: Book;
  otherUser: { name: string; initials: string; neighborhood: string };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

export const ME: User = {
  id: 'me',
  name: 'Patrice N.',
  initials: 'PN',
  booksShared: 12,
  booksBorrowed: 8,
  neighborhood: 'Glebe, Ottawa',
  memberSince: 'January 2024',
};

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    condition: 'Great',
    status: 'available',
    owner: { id: 'u1', name: 'Sarah M.', initials: 'SM', neighborhood: 'Glebe, Ottawa' },
    neighborhood: 'Glebe, Ottawa',
    distance: '0.3 km',
    lat: 45.4112,
    lng: -75.6865,
    description:
      'A lone astronaut must save Earth from a mysterious, seemingly impossible threat. A riveting page-turner full of science and heart.',
    genre: 'Science Fiction',
  },
  {
    id: '2',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    condition: 'Good',
    status: 'available',
    owner: { id: 'u2', name: 'James K.', initials: 'JK', neighborhood: 'Centretown, Ottawa' },
    neighborhood: 'Centretown, Ottawa',
    distance: '0.8 km',
    lat: 45.4201,
    lng: -75.6922,
    description:
      'Reclusive Hollywood star Evelyn Hugo finally reveals her glamorous life — and the seven men she married along the way.',
    genre: 'Literary Fiction',
  },
  {
    id: '3',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    condition: 'Like New',
    status: 'on-loan',
    owner: { id: 'u3', name: 'Leila R.', initials: 'LR', neighborhood: 'Westboro, Ottawa' },
    neighborhood: 'Westboro, Ottawa',
    distance: '1.2 km',
    lat: 45.3933,
    lng: -75.7524,
    description:
      'A mysterious man lives alone in a house of endless halls and statues — until a stranger arrives with dangerous knowledge.',
    genre: 'Fantasy',
  },
  {
    id: '4',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    condition: 'Good',
    status: 'available',
    owner: { id: 'u4', name: 'Omar T.', initials: 'OT', neighborhood: 'Old Ottawa South' },
    neighborhood: 'Old Ottawa South',
    distance: '1.5 km',
    lat: 45.3987,
    lng: -75.6812,
    description:
      'Two friends spend decades making video games together — a luminous story about creativity, love, and the work of a lifetime.',
    genre: 'Literary Fiction',
  },
  {
    id: '5',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    condition: 'Acceptable',
    status: 'available',
    owner: { id: 'u1', name: 'Sarah M.', initials: 'SM', neighborhood: 'Glebe, Ottawa' },
    neighborhood: 'Glebe, Ottawa',
    distance: '0.3 km',
    lat: 45.4089,
    lng: -75.6891,
    description:
      'Between life and death there is a library — Nora Seed faces the lives she could have lived, and makes the choice to stay.',
    genre: 'Contemporary Fiction',
  },
  {
    id: '6',
    title: 'Demon Copperhead',
    author: 'Barbara Kingsolver',
    condition: 'Great',
    status: 'available',
    owner: { id: 'u5', name: 'Maya P.', initials: 'MP', neighborhood: 'Hintonburg, Ottawa' },
    neighborhood: 'Hintonburg, Ottawa',
    distance: '2.1 km',
    lat: 45.4058,
    lng: -75.7354,
    description:
      "A Dickensian retelling set in Appalachia: a boy navigates foster care, poverty, and the opioid crisis with fierce wit.",
    genre: 'Historical Fiction',
  },
];

export const MOCK_MY_BOOKS: Book[] = [
  {
    id: '7',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    condition: 'Like New',
    status: 'on-loan',
    owner: { id: 'me', name: 'Patrice N.', initials: 'PN', neighborhood: 'Glebe, Ottawa' },
    neighborhood: 'Glebe, Ottawa',
    distance: '0 km',
    lat: 45.4115,
    lng: -75.688,
    description: 'An Artificial Friend observes the world and worries deeply about the girl she loves.',
    genre: 'Science Fiction',
  },
  {
    id: '8',
    title: 'A Gentleman in Moscow',
    author: 'Amor Towles',
    condition: 'Good',
    status: 'hidden',
    owner: { id: 'me', name: 'Patrice N.', initials: 'PN', neighborhood: 'Glebe, Ottawa' },
    neighborhood: 'Glebe, Ottawa',
    distance: '0 km',
    lat: 45.4115,
    lng: -75.688,
    description:
      'A Russian count is sentenced to house arrest in a luxury hotel — and lives a remarkable life within its walls for decades.',
    genre: 'Historical Fiction',
  },
  {
    id: '9',
    title: 'Station Eleven',
    author: 'Emily St. John Mandel',
    condition: 'Great',
    status: 'available',
    owner: { id: 'me', name: 'Patrice N.', initials: 'PN', neighborhood: 'Glebe, Ottawa' },
    neighborhood: 'Glebe, Ottawa',
    distance: '0 km',
    lat: 45.4115,
    lng: -75.688,
    description:
      'A pandemic collapses civilization overnight. Twenty years later, a traveling Shakespeare troupe roams the Great Lakes.',
    genre: 'Literary Fiction',
  },
];

export const MOCK_BORROWED_BOOKS: Book[] = [
  { ...MOCK_BOOKS[1], status: 'on-loan' },
];

export const MOCK_LOANS: Loan[] = [
  {
    id: 'loan1',
    book: MOCK_BOOKS[1],
    borrower: { id: 'me', name: 'Patrice N.', initials: 'PN' },
    lender: { id: 'u2', name: 'James K.', initials: 'JK' },
    status: 'active',
    startDate: '2025-05-01',
    dueDate: '2025-05-22',
    returnedDate: null,
  },
  {
    id: 'loan2',
    book: MOCK_MY_BOOKS[0],
    borrower: { id: 'u4', name: 'Omar T.', initials: 'OT' },
    lender: { id: 'me', name: 'Patrice N.', initials: 'PN' },
    status: 'active',
    startDate: '2025-05-05',
    dueDate: '2025-05-26',
    returnedDate: null,
  },
];

export const MOCK_REQUESTS: BorrowRequest[] = [
  {
    id: 'req1',
    book: MOCK_MY_BOOKS[2],
    requester: { id: 'u5', name: 'Maya P.', initials: 'MP' },
    message: "Hi! I've been wanting to read this for ages. I'll take great care of it.",
    createdAt: '2025-05-09T14:22:00Z',
  },
  {
    id: 'req2',
    book: MOCK_MY_BOOKS[1],
    requester: { id: 'u2', name: 'James K.', initials: 'JK' },
    message: "Been meaning to get to Towles for a while. Thanks for sharing!",
    createdAt: '2025-05-08T09:10:00Z',
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    loanId: 'loan1',
    senderId: 'u2',
    text: 'Hi! Looking forward to lending you the book. Still available for pickup tomorrow morning?',
    timestamp: '2025-05-10T10:30:00Z',
  },
  {
    id: 'm2',
    loanId: 'loan1',
    senderId: 'me',
    text: "Yes, any time after 9am works! I'm in the Glebe near Bank St.",
    timestamp: '2025-05-10T10:35:00Z',
  },
  {
    id: 'm3',
    loanId: 'loan1',
    senderId: 'u2',
    text: "Perfect — I'll swing by around 9:30. See you soon!",
    timestamp: '2025-05-10T10:41:00Z',
  },
  {
    id: 'm4',
    loanId: 'loan1',
    senderId: 'me',
    text: 'Great, see you then!',
    timestamp: '2025-05-10T10:43:00Z',
  },
];

export const MOCK_CHAT_THREADS: ChatThread[] = [
  {
    loanId: 'loan1',
    book: MOCK_BOOKS[1],
    otherUser: { name: 'James K.', initials: 'JK', neighborhood: 'Centretown, Ottawa' },
    lastMessage: 'Great, see you then!',
    lastMessageTime: '2025-05-10T10:43:00Z',
    unread: false,
  },
  {
    loanId: 'loan2',
    book: MOCK_MY_BOOKS[0],
    otherUser: { name: 'Omar T.', initials: 'OT', neighborhood: 'Old Ottawa South' },
    lastMessage: 'Thanks so much for sharing!',
    lastMessageTime: '2025-05-07T17:20:00Z',
    unread: true,
  },
];
