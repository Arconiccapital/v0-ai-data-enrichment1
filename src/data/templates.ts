/**
 * Predefined templates with example data for spreadsheet generation
 */

import { TemplateDefinition } from '@/src/types/templates'

export const templates: Record<string, TemplateDefinition> = {
  company: {
    id: 'company',
    name: 'Company Research',
    description: 'Research and track company information including revenue, employees, and funding',
    icon: '🏢',
    category: 'business',
    columns: [
      { name: 'Company Name', type: 'text' },
      { name: 'Website', type: 'url' },
      { name: 'Industry', type: 'text' },
      { name: 'Founded Year', type: 'number' },
      { name: 'Headquarters', type: 'text' },
      { name: 'Employee Count', type: 'number' },
      { name: 'Revenue (USD)', type: 'currency' },
      { name: 'Funding Total', type: 'currency' },
      { name: 'Last Funding Round', type: 'text' },
      { name: 'CEO', type: 'text' },
      { name: 'Description', type: 'text' }
    ],
    sampleData: [
      {
        'Company Name': 'Stripe',
        'Website': 'https://stripe.com',
        'Industry': 'Financial Services',
        'Founded Year': 2010,
        'Headquarters': 'San Francisco, CA',
        'Employee Count': 8000,
        'Revenue (USD)': 14400000000,
        'Funding Total': 8700000000,
        'Last Funding Round': 'Series I',
        'CEO': 'Patrick Collison',
        'Description': 'Online payment processing platform for businesses'
      },
      {
        'Company Name': 'Canva',
        'Website': 'https://canva.com',
        'Industry': 'Design Software',
        'Founded Year': 2013,
        'Headquarters': 'Sydney, Australia',
        'Employee Count': 3500,
        'Revenue (USD)': 1600000000,
        'Funding Total': 572000000,
        'Last Funding Round': 'Series A',
        'CEO': 'Melanie Perkins',
        'Description': 'Graphic design platform for creating visual content'
      },
      {
        'Company Name': 'Databricks',
        'Website': 'https://databricks.com',
        'Industry': 'Data Analytics',
        'Founded Year': 2013,
        'Headquarters': 'San Francisco, CA',
        'Employee Count': 5000,
        'Revenue (USD)': 1500000000,
        'Funding Total': 3500000000,
        'Last Funding Round': 'Series I',
        'CEO': 'Ali Ghodsi',
        'Description': 'Unified analytics platform for big data and AI'
      }
    ]
  },

  investor: {
    id: 'investor',
    name: 'Investor Tracking',
    description: 'Track venture capital firms and their investment portfolios',
    icon: '💰',
    category: 'finance',
    columns: [
      { name: 'VC Firm', type: 'text' },
      { name: 'Website', type: 'url' },
      { name: 'Location', type: 'text' },
      { name: 'Fund Size (USD)', type: 'currency' },
      { name: 'Investment Stage', type: 'text' },
      { name: 'Portfolio Companies', type: 'number' },
      { name: 'Notable Investments', type: 'text' },
      { name: 'Sectors', type: 'text' },
      { name: 'Partners', type: 'number' },
      { name: 'Contact Email', type: 'email' }
    ],
    sampleData: [
      {
        'VC Firm': 'Sequoia Capital',
        'Website': 'https://sequoiacap.com',
        'Location': 'Menlo Park, CA',
        'Fund Size (USD)': 85000000000,
        'Investment Stage': 'Seed to Growth',
        'Portfolio Companies': 1000,
        'Notable Investments': 'Airbnb, Apple, Google, Instagram, LinkedIn',
        'Sectors': 'Technology, Healthcare, Fintech',
        'Partners': 30,
        'Contact Email': 'info@sequoiacap.com'
      },
      {
        'VC Firm': 'Andreessen Horowitz',
        'Website': 'https://a16z.com',
        'Location': 'Menlo Park, CA',
        'Fund Size (USD)': 35000000000,
        'Investment Stage': 'Seed to Late Stage',
        'Portfolio Companies': 450,
        'Notable Investments': 'Facebook, Twitter, Lyft, Coinbase, Robinhood',
        'Sectors': 'Software, Crypto, Bio, Gaming',
        'Partners': 180,
        'Contact Email': 'info@a16z.com'
      },
      {
        'VC Firm': 'Accel',
        'Website': 'https://accel.com',
        'Location': 'Palo Alto, CA',
        'Fund Size (USD)': 20000000000,
        'Investment Stage': 'Early to Growth',
        'Portfolio Companies': 600,
        'Notable Investments': 'Meta, Spotify, Slack, Dropbox, Atlassian',
        'Sectors': 'Enterprise, Consumer, Fintech',
        'Partners': 60,
        'Contact Email': 'info@accel.com'
      }
    ]
  },

  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Profiles',
    description: 'Extract and organize LinkedIn profile information',
    icon: '💼',
    category: 'social',
    columns: [
      { name: 'Full Name', type: 'text' },
      { name: 'LinkedIn URL', type: 'url' },
      { name: 'Current Title', type: 'text' },
      { name: 'Company', type: 'text' },
      { name: 'Location', type: 'text' },
      { name: 'Experience (Years)', type: 'number' },
      { name: 'Education', type: 'text' },
      { name: 'Skills', type: 'text' },
      { name: 'Connections', type: 'number' },
      { name: 'Email', type: 'email' }
    ],
    sampleData: [
      {
        'Full Name': 'Sarah Johnson',
        'LinkedIn URL': 'https://linkedin.com/in/sarahjohnson',
        'Current Title': 'VP of Engineering',
        'Company': 'TechCorp Inc',
        'Location': 'San Francisco, CA',
        'Experience (Years)': 15,
        'Education': 'Stanford University - MS Computer Science',
        'Skills': 'Python, Cloud Architecture, Team Leadership, DevOps',
        'Connections': 2500,
        'Email': 'sarah.johnson@techcorp.com'
      },
      {
        'Full Name': 'Michael Chen',
        'LinkedIn URL': 'https://linkedin.com/in/michaelchen',
        'Current Title': 'Product Manager',
        'Company': 'Innovation Labs',
        'Location': 'New York, NY',
        'Experience (Years)': 8,
        'Education': 'MIT - MBA',
        'Skills': 'Product Strategy, Agile, Data Analysis, User Research',
        'Connections': 1800,
        'Email': 'mchen@innovationlabs.com'
      },
      {
        'Full Name': 'Emily Rodriguez',
        'LinkedIn URL': 'https://linkedin.com/in/emilyrodriguez',
        'Current Title': 'Data Scientist',
        'Company': 'DataCo Analytics',
        'Location': 'Austin, TX',
        'Experience (Years)': 6,
        'Education': 'UC Berkeley - PhD Data Science',
        'Skills': 'Machine Learning, Python, R, SQL, Statistics',
        'Connections': 1200,
        'Email': 'emily.r@dataco.com'
      }
    ]
  },

  'price-comparison': {
    id: 'price-comparison',
    name: 'Price Comparison',
    description: 'Compare product prices across different retailers',
    icon: '🛒',
    category: 'business',
    columns: [
      { name: 'Product Name', type: 'text' },
      { name: 'Category', type: 'text' },
      { name: 'Brand', type: 'text' },
      { name: 'Retailer', type: 'text' },
      { name: 'Price (USD)', type: 'currency' },
      { name: 'Original Price', type: 'currency' },
      { name: 'Discount %', type: 'number' },
      { name: 'In Stock', type: 'boolean' },
      { name: 'Rating', type: 'number' },
      { name: 'Product URL', type: 'url' }
    ],
    sampleData: [
      {
        'Product Name': 'iPhone 15 Pro 256GB',
        'Category': 'Electronics',
        'Brand': 'Apple',
        'Retailer': 'Amazon',
        'Price (USD)': 1099,
        'Original Price': 1199,
        'Discount %': 8,
        'In Stock': true,
        'Rating': 4.5,
        'Product URL': 'https://amazon.com/iphone-15-pro'
      },
      {
        'Product Name': 'iPhone 15 Pro 256GB',
        'Category': 'Electronics',
        'Brand': 'Apple',
        'Retailer': 'Best Buy',
        'Price (USD)': 1149,
        'Original Price': 1199,
        'Discount %': 4,
        'In Stock': true,
        'Rating': 4.6,
        'Product URL': 'https://bestbuy.com/iphone-15-pro'
      },
      {
        'Product Name': 'Sony WH-1000XM5',
        'Category': 'Audio',
        'Brand': 'Sony',
        'Retailer': 'Target',
        'Price (USD)': 329,
        'Original Price': 399,
        'Discount %': 18,
        'In Stock': false,
        'Rating': 4.7,
        'Product URL': 'https://target.com/sony-wh1000xm5'
      }
    ]
  },

  recruiting: {
    id: 'recruiting',
    name: 'Recruiting Pipeline',
    description: 'Track candidates through your hiring process',
    icon: '👥',
    category: 'recruiting',
    columns: [
      { name: 'Candidate Name', type: 'text' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'text' },
      { name: 'Position Applied', type: 'text' },
      { name: 'Current Stage', type: 'text' },
      { name: 'Experience (Years)', type: 'number' },
      { name: 'Resume URL', type: 'url' },
      { name: 'LinkedIn', type: 'url' },
      { name: 'Interview Score', type: 'number' },
      { name: 'Salary Expectation', type: 'currency' },
      { name: 'Notes', type: 'text' }
    ],
    sampleData: [
      {
        'Candidate Name': 'Alex Thompson',
        'Email': 'alex.thompson@email.com',
        'Phone': '+1-555-0123',
        'Position Applied': 'Senior Software Engineer',
        'Current Stage': 'Technical Interview',
        'Experience (Years)': 8,
        'Resume URL': 'https://drive.google.com/resume-alex',
        'LinkedIn': 'https://linkedin.com/in/alexthompson',
        'Interview Score': 8.5,
        'Salary Expectation': 180000,
        'Notes': 'Strong backend experience, good cultural fit'
      },
      {
        'Candidate Name': 'Maria Garcia',
        'Email': 'maria.garcia@email.com',
        'Phone': '+1-555-0124',
        'Position Applied': 'Product Designer',
        'Current Stage': 'Final Round',
        'Experience (Years)': 5,
        'Resume URL': 'https://drive.google.com/resume-maria',
        'LinkedIn': 'https://linkedin.com/in/mariagarcia',
        'Interview Score': 9.2,
        'Salary Expectation': 140000,
        'Notes': 'Excellent portfolio, experience with design systems'
      },
      {
        'Candidate Name': 'James Wilson',
        'Email': 'james.wilson@email.com',
        'Phone': '+1-555-0125',
        'Position Applied': 'Data Analyst',
        'Current Stage': 'Phone Screen',
        'Experience (Years)': 3,
        'Resume URL': 'https://drive.google.com/resume-james',
        'LinkedIn': 'https://linkedin.com/in/jameswilson',
        'Interview Score': 7.0,
        'Salary Expectation': 95000,
        'Notes': 'Good SQL skills, needs Python assessment'
      }
    ]
  },

  'stock-analysis': {
    id: 'stock-analysis',
    name: 'Stock Analysis',
    description: 'Analyze stock market data and company financials',
    icon: '📈',
    category: 'finance',
    columns: [
      { name: 'Ticker', type: 'text' },
      { name: 'Company Name', type: 'text' },
      { name: 'Current Price', type: 'currency' },
      { name: '52W High', type: 'currency' },
      { name: '52W Low', type: 'currency' },
      { name: 'Market Cap', type: 'currency' },
      { name: 'P/E Ratio', type: 'number' },
      { name: 'Dividend Yield %', type: 'number' },
      { name: 'Volume', type: 'number' },
      { name: 'YTD Change %', type: 'number' },
      { name: 'Analyst Rating', type: 'text' }
    ],
    sampleData: [
      {
        'Ticker': 'AAPL',
        'Company Name': 'Apple Inc.',
        'Current Price': 195.89,
        '52W High': 199.62,
        '52W Low': 164.08,
        'Market Cap': 3040000000000,
        'P/E Ratio': 32.8,
        'Dividend Yield %': 0.44,
        'Volume': 58935200,
        'YTD Change %': 48.2,
        'Analyst Rating': 'Buy'
      },
      {
        'Ticker': 'MSFT',
        'Company Name': 'Microsoft Corporation',
        'Current Price': 378.85,
        '52W High': 384.52,
        '52W Low': 275.42,
        'Market Cap': 2810000000000,
        'P/E Ratio': 35.4,
        'Dividend Yield %': 0.72,
        'Volume': 22156300,
        'YTD Change %': 42.7,
        'Analyst Rating': 'Strong Buy'
      },
      {
        'Ticker': 'GOOGL',
        'Company Name': 'Alphabet Inc.',
        'Current Price': 141.80,
        '52W High': 153.78,
        '52W Low': 121.46,
        'Market Cap': 1790000000000,
        'P/E Ratio': 27.3,
        'Dividend Yield %': 0,
        'Volume': 29847100,
        'YTD Change %': 55.8,
        'Analyst Rating': 'Buy'
      }
    ]
  },

  startup: {
    id: 'startup',
    name: 'Startup Database',
    description: 'Track startups and their key metrics',
    icon: '🚀',
    category: 'business',
    columns: [
      { name: 'Startup Name', type: 'text' },
      { name: 'Website', type: 'url' },
      { name: 'Founded', type: 'date' },
      { name: 'Founders', type: 'text' },
      { name: 'Industry', type: 'text' },
      { name: 'Stage', type: 'text' },
      { name: 'Total Raised', type: 'currency' },
      { name: 'Last Valuation', type: 'currency' },
      { name: 'Investors', type: 'text' },
      { name: 'Employee Count', type: 'number' },
      { name: 'HQ Location', type: 'text' }
    ],
    sampleData: [
      {
        'Startup Name': 'OpenAI',
        'Website': 'https://openai.com',
        'Founded': '2015-12-11',
        'Founders': 'Sam Altman, Elon Musk, Greg Brockman',
        'Industry': 'Artificial Intelligence',
        'Stage': 'Late Stage',
        'Total Raised': 11300000000,
        'Last Valuation': 86000000000,
        'Investors': 'Microsoft, Khosla Ventures, Reid Hoffman',
        'Employee Count': 770,
        'HQ Location': 'San Francisco, CA'
      },
      {
        'Startup Name': 'SpaceX',
        'Website': 'https://spacex.com',
        'Founded': '2002-03-14',
        'Founders': 'Elon Musk',
        'Industry': 'Aerospace',
        'Stage': 'Late Stage',
        'Total Raised': 9800000000,
        'Last Valuation': 180000000000,
        'Investors': 'Google, Fidelity, Founders Fund',
        'Employee Count': 13000,
        'HQ Location': 'Hawthorne, CA'
      },
      {
        'Startup Name': 'Anthropic',
        'Website': 'https://anthropic.com',
        'Founded': '2021-01-15',
        'Founders': 'Dario Amodei, Daniela Amodei',
        'Industry': 'Artificial Intelligence',
        'Stage': 'Series C',
        'Total Raised': 7300000000,
        'Last Valuation': 18400000000,
        'Investors': 'Google, Salesforce Ventures, Spark Capital',
        'Employee Count': 400,
        'HQ Location': 'San Francisco, CA'
      }
    ]
  },

  'research-papers': {
    id: 'research-papers',
    name: 'Research Papers',
    description: 'Organize academic papers and research publications',
    icon: '📚',
    category: 'research',
    columns: [
      { name: 'Paper Title', type: 'text' },
      { name: 'Authors', type: 'text' },
      { name: 'Publication Year', type: 'number' },
      { name: 'Journal/Conference', type: 'text' },
      { name: 'Field', type: 'text' },
      { name: 'Citations', type: 'number' },
      { name: 'DOI', type: 'text' },
      { name: 'Abstract', type: 'text' },
      { name: 'Keywords', type: 'text' },
      { name: 'PDF URL', type: 'url' }
    ],
    sampleData: [
      {
        'Paper Title': 'Attention Is All You Need',
        'Authors': 'Vaswani et al.',
        'Publication Year': 2017,
        'Journal/Conference': 'NeurIPS',
        'Field': 'Machine Learning',
        'Citations': 95000,
        'DOI': '10.48550/arXiv.1706.03762',
        'Abstract': 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
        'Keywords': 'transformer, attention mechanism, NLP, deep learning',
        'PDF URL': 'https://arxiv.org/pdf/1706.03762.pdf'
      },
      {
        'Paper Title': 'BERT: Pre-training of Deep Bidirectional Transformers',
        'Authors': 'Devlin et al.',
        'Publication Year': 2019,
        'Journal/Conference': 'NAACL',
        'Field': 'Natural Language Processing',
        'Citations': 72000,
        'DOI': '10.18653/v1/N19-1423',
        'Abstract': 'We introduce a new language representation model called BERT...',
        'Keywords': 'BERT, language model, pre-training, NLP',
        'PDF URL': 'https://arxiv.org/pdf/1810.04805.pdf'
      },
      {
        'Paper Title': 'ImageNet Classification with Deep Convolutional Neural Networks',
        'Authors': 'Krizhevsky, Sutskever, Hinton',
        'Publication Year': 2012,
        'Journal/Conference': 'NeurIPS',
        'Field': 'Computer Vision',
        'Citations': 122000,
        'DOI': '10.1145/3065386',
        'Abstract': 'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images...',
        'Keywords': 'AlexNet, CNN, ImageNet, deep learning',
        'PDF URL': 'https://papers.nips.cc/paper/4824-imagenet-classification.pdf'
      }
    ]
  },

  'real-estate': {
    id: 'real-estate',
    name: 'Real Estate Listings',
    description: 'Track property listings and real estate opportunities',
    icon: '🏠',
    category: 'real-estate',
    columns: [
      { name: 'Property Address', type: 'text' },
      { name: 'City', type: 'text' },
      { name: 'State', type: 'text' },
      { name: 'ZIP Code', type: 'text' },
      { name: 'Price', type: 'currency' },
      { name: 'Bedrooms', type: 'number' },
      { name: 'Bathrooms', type: 'number' },
      { name: 'Square Feet', type: 'number' },
      { name: 'Lot Size (acres)', type: 'number' },
      { name: 'Year Built', type: 'number' },
      { name: 'Property Type', type: 'text' },
      { name: 'Listing URL', type: 'url' }
    ],
    sampleData: [
      {
        'Property Address': '123 Main Street',
        'City': 'San Francisco',
        'State': 'CA',
        'ZIP Code': '94102',
        'Price': 1250000,
        'Bedrooms': 3,
        'Bathrooms': 2,
        'Square Feet': 1800,
        'Lot Size (acres)': 0.15,
        'Year Built': 1925,
        'Property Type': 'Single Family Home',
        'Listing URL': 'https://zillow.com/listing-123main'
      },
      {
        'Property Address': '456 Park Avenue #12B',
        'City': 'New York',
        'State': 'NY',
        'ZIP Code': '10016',
        'Price': 2850000,
        'Bedrooms': 2,
        'Bathrooms': 2.5,
        'Square Feet': 1650,
        'Lot Size (acres)': 0,
        'Year Built': 2018,
        'Property Type': 'Condo',
        'Listing URL': 'https://streeteasy.com/listing-456park'
      },
      {
        'Property Address': '789 Beach Road',
        'City': 'Miami Beach',
        'State': 'FL',
        'ZIP Code': '33139',
        'Price': 3500000,
        'Bedrooms': 5,
        'Bathrooms': 4.5,
        'Square Feet': 4200,
        'Lot Size (acres)': 0.25,
        'Year Built': 2020,
        'Property Type': 'Luxury Villa',
        'Listing URL': 'https://realtor.com/listing-789beach'
      }
    ]
  },

  'twitter-profile': {
    id: 'twitter-profile',
    name: 'Twitter Profiles',
    description: 'Analyze Twitter/X user profiles and metrics',
    icon: '🐦',
    category: 'social',
    columns: [
      { name: 'Username', type: 'text' },
      { name: 'Display Name', type: 'text' },
      { name: 'Bio', type: 'text' },
      { name: 'Followers', type: 'number' },
      { name: 'Following', type: 'number' },
      { name: 'Tweets', type: 'number' },
      { name: 'Verified', type: 'boolean' },
      { name: 'Joined Date', type: 'date' },
      { name: 'Location', type: 'text' },
      { name: 'Website', type: 'url' },
      { name: 'Profile URL', type: 'url' }
    ],
    sampleData: [
      {
        'Username': '@elonmusk',
        'Display Name': 'Elon Musk',
        'Bio': 'Mars & Cars, Chips & Dips',
        'Followers': 175000000,
        'Following': 500,
        'Tweets': 35000,
        'Verified': true,
        'Joined Date': '2009-06-02',
        'Location': 'Mars',
        'Website': 'https://tesla.com',
        'Profile URL': 'https://twitter.com/elonmusk'
      },
      {
        'Username': '@sama',
        'Display Name': 'Sam Altman',
        'Bio': 'CEO @OpenAI',
        'Followers': 2800000,
        'Following': 1200,
        'Tweets': 8500,
        'Verified': true,
        'Joined Date': '2008-03-17',
        'Location': 'San Francisco',
        'Website': 'https://openai.com',
        'Profile URL': 'https://twitter.com/sama'
      },
      {
        'Username': '@paulg',
        'Display Name': 'Paul Graham',
        'Bio': 'Founder of Y Combinator, writer, programmer',
        'Followers': 1900000,
        'Following': 350,
        'Tweets': 12000,
        'Verified': true,
        'Joined Date': '2008-04-26',
        'Location': 'England',
        'Website': 'http://paulgraham.com',
        'Profile URL': 'https://twitter.com/paulg'
      }
    ]
  },

  waitlist: {
    id: 'waitlist',
    name: 'Waitlist Manager',
    description: 'Manage product waitlists and early access signups',
    icon: '⏳',
    category: 'business',
    columns: [
      { name: 'Full Name', type: 'text' },
      { name: 'Email', type: 'email' },
      { name: 'Company', type: 'text' },
      { name: 'Role', type: 'text' },
      { name: 'Signup Date', type: 'date' },
      { name: 'Priority Score', type: 'number' },
      { name: 'Referral Source', type: 'text' },
      { name: 'Use Case', type: 'text' },
      { name: 'Status', type: 'text' },
      { name: 'Invite Sent', type: 'boolean' },
      { name: 'Notes', type: 'text' }
    ],
    sampleData: [
      {
        'Full Name': 'Jennifer Adams',
        'Email': 'jennifer.adams@techstartup.com',
        'Company': 'TechStartup Inc',
        'Role': 'CTO',
        'Signup Date': '2024-01-15',
        'Priority Score': 95,
        'Referral Source': 'Product Hunt',
        'Use Case': 'API integration for analytics platform',
        'Status': 'Approved',
        'Invite Sent': true,
        'Notes': 'High-value potential customer, enterprise plan'
      },
      {
        'Full Name': 'David Lee',
        'Email': 'dlee@designagency.com',
        'Company': 'Design Agency Co',
        'Role': 'Creative Director',
        'Signup Date': '2024-01-18',
        'Priority Score': 78,
        'Referral Source': 'Twitter',
        'Use Case': 'Team collaboration on design projects',
        'Status': 'Pending',
        'Invite Sent': false,
        'Notes': 'Interested in team features, 10+ seats'
      },
      {
        'Full Name': 'Rachel Green',
        'Email': 'rachel.green@consulting.com',
        'Company': 'Global Consulting LLC',
        'Role': 'Product Manager',
        'Signup Date': '2024-01-20',
        'Priority Score': 82,
        'Referral Source': 'LinkedIn',
        'Use Case': 'Client project management',
        'Status': 'Pending',
        'Invite Sent': false,
        'Notes': 'Fortune 500 company, potential enterprise deal'
      }
    ]
  },

  'twitter-activity': {
    id: 'twitter-activity',
    name: 'Twitter Activity',
    description: 'Track Twitter/X post engagement and analytics',
    icon: '📊',
    category: 'social',
    columns: [
      { name: 'Tweet Text', type: 'text' },
      { name: 'Author', type: 'text' },
      { name: 'Date Posted', type: 'date' },
      { name: 'Likes', type: 'number' },
      { name: 'Retweets', type: 'number' },
      { name: 'Replies', type: 'number' },
      { name: 'Impressions', type: 'number' },
      { name: 'Engagement Rate %', type: 'number' },
      { name: 'Media Type', type: 'text' },
      { name: 'Hashtags', type: 'text' },
      { name: 'Tweet URL', type: 'url' }
    ],
    sampleData: [
      {
        'Tweet Text': 'Just shipped our new AI feature! 🚀 Early users are seeing 10x productivity gains...',
        'Author': '@productcompany',
        'Date Posted': '2024-01-25',
        'Likes': 2456,
        'Retweets': 489,
        'Replies': 127,
        'Impressions': 45000,
        'Engagement Rate %': 6.8,
        'Media Type': 'Image',
        'Hashtags': '#AI #ProductLaunch #StartupLife',
        'Tweet URL': 'https://twitter.com/productcompany/status/123456'
      },
      {
        'Tweet Text': 'The best time to start was yesterday. The second best time is now.',
        'Author': '@motivational',
        'Date Posted': '2024-01-24',
        'Likes': 8923,
        'Retweets': 2341,
        'Replies': 456,
        'Impressions': 125000,
        'Engagement Rate %': 9.4,
        'Media Type': 'Text Only',
        'Hashtags': '#Motivation #Success',
        'Tweet URL': 'https://twitter.com/motivational/status/234567'
      },
      {
        'Tweet Text': 'Thread: 10 lessons from building a $100M company 🧵',
        'Author': '@founderinsights',
        'Date Posted': '2024-01-23',
        'Likes': 15670,
        'Retweets': 4892,
        'Replies': 892,
        'Impressions': 350000,
        'Engagement Rate %': 6.2,
        'Media Type': 'Thread',
        'Hashtags': '#Entrepreneurship #StartupAdvice',
        'Tweet URL': 'https://twitter.com/founderinsights/status/345678'
      }
    ]
  },

  'travel-planning': {
    id: 'travel-planning',
    name: 'Travel Planning',
    description: 'Plan and organize travel destinations and itineraries',
    icon: '✈️',
    category: 'travel',
    columns: [
      { name: 'Destination', type: 'text' },
      { name: 'Best Time to Visit', type: 'text' },
      { name: 'Average Cost per Day', type: 'currency' },
      { name: 'Visa Required', type: 'boolean' },
      { name: 'Flight Duration', type: 'text' },
      { name: 'Main Attractions', type: 'text' },
      { name: 'Safety Rating', type: 'text' },
      { name: 'Language', type: 'text' },
      { name: 'Currency', type: 'text' },
      { name: 'Time Zone', type: 'text' }
    ],
    sampleData: [
      {
        'Destination': 'Tokyo, Japan',
        'Best Time to Visit': 'March-May, Sept-Nov',
        'Average Cost per Day': 150,
        'Visa Required': false,
        'Flight Duration': '11h from NYC',
        'Main Attractions': 'Senso-ji Temple, Tokyo Tower, Shibuya Crossing',
        'Safety Rating': 'Very Safe',
        'Language': 'Japanese',
        'Currency': 'JPY',
        'Time Zone': 'JST (UTC+9)'
      },
      {
        'Destination': 'Paris, France',
        'Best Time to Visit': 'June-August',
        'Average Cost per Day': 200,
        'Visa Required': false,
        'Flight Duration': '7h from NYC',
        'Main Attractions': 'Eiffel Tower, Louvre, Notre-Dame',
        'Safety Rating': 'Safe',
        'Language': 'French',
        'Currency': 'EUR',
        'Time Zone': 'CET (UTC+1)'
      },
      {
        'Destination': 'Bali, Indonesia',
        'Best Time to Visit': 'April-October',
        'Average Cost per Day': 60,
        'Visa Required': true,
        'Flight Duration': '20h from NYC',
        'Main Attractions': 'Temples, Rice Terraces, Beaches',
        'Safety Rating': 'Safe',
        'Language': 'Indonesian',
        'Currency': 'IDR',
        'Time Zone': 'WITA (UTC+8)'
      },
      {
        'Destination': 'Barcelona, Spain',
        'Best Time to Visit': 'May-June',
        'Average Cost per Day': 120,
        'Visa Required': false,
        'Flight Duration': '8h from NYC',
        'Main Attractions': 'Sagrada Familia, Park Güell, Las Ramblas',
        'Safety Rating': 'Safe',
        'Language': 'Spanish, Catalan',
        'Currency': 'EUR',
        'Time Zone': 'CET (UTC+1)'
      },
      {
        'Destination': 'Dubai, UAE',
        'Best Time to Visit': 'November-March',
        'Average Cost per Day': 250,
        'Visa Required': true,
        'Flight Duration': '12h from NYC',
        'Main Attractions': 'Burj Khalifa, Dubai Mall, Palm Jumeirah',
        'Safety Rating': 'Very Safe',
        'Language': 'Arabic, English',
        'Currency': 'AED',
        'Time Zone': 'GST (UTC+4)'
      },
      {
        'Destination': 'Sydney, Australia',
        'Best Time to Visit': 'September-November',
        'Average Cost per Day': 180,
        'Visa Required': true,
        'Flight Duration': '22h from NYC',
        'Main Attractions': 'Opera House, Harbour Bridge, Bondi Beach',
        'Safety Rating': 'Very Safe',
        'Language': 'English',
        'Currency': 'AUD',
        'Time Zone': 'AEDT (UTC+11)'
      }
    ]
  }
}