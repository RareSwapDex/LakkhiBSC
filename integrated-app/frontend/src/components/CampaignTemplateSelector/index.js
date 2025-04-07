import React, { useState } from 'react';
import { Modal, Button, Card, Row, Col, Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faLeaf,
  faHandHoldingHeart,
  faGraduationCap,
  faRobot,
  faPalette,
  faGamepad,
  faStore,
  faMicrochip,
  faChartLine,
  faPlus,
  faLaptopCode,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import './styles.css';

// Template data
const CAMPAIGN_TEMPLATES = [
  {
    id: 'community-garden',
    name: 'Community Garden',
    icon: faLeaf,
    color: '#28a745',
    description: 'Create a sustainable garden to bring the community together, provide fresh produce, and improve urban green spaces.',
    category: 'Community',
    milestones: [
      { title: 'Land Acquisition & Planning', percentage: 15 },
      { title: 'Initial Garden Setup', percentage: 30 },
      { title: 'Community Programs Launch', percentage: 25 },
      { title: 'Expansion & Sustainability', percentage: 30 }
    ],
    sampleText: 'Our community garden project aims to transform an unused urban space into a thriving garden that provides fresh produce, educational opportunities, and a gathering space for our community.',
    prefilledFields: {
      basics: {
        category: 'environment',
        tags: ['gardening', 'community', 'sustainability']
      },
      story: {
        projectStory: '<p>Our community garden project will transform an unused lot into a vibrant green space where neighbors can grow food, learn about gardening, and build community connections. The garden will serve as both a source of fresh produce and a gathering space for community events.</p><p>By creating this garden, we hope to address food insecurity in our area while creating educational opportunities for schools and youth groups. We\'ll use sustainable gardening practices that improve soil health and promote biodiversity.</p>',
        projectGoals: '<p>1. Convert the vacant lot at [Location] into a productive community garden</p><p>2. Establish at least 20 individual garden plots for community members</p><p>3. Create an educational program partnering with local schools</p><p>4. Host monthly community events and workshops</p><p>5. Generate a sustainable model for long-term garden operations</p>',
        projectRisks: '<p>Potential challenges include securing long-term land access, managing volunteer turnover, and seasonal weather variations affecting crops. We have plans to address each of these concerns through legal agreements, strong leadership structure, and diversified planting schedules.</p>'
      }
    }
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    icon: faMicrochip,
    color: '#0d6efd',
    description: 'Fund your tech innovation, from prototype to market launch. Perfect for SaaS, apps, or hardware products.',
    category: 'Technology',
    milestones: [
      { title: 'Prototype Development', percentage: 20 },
      { title: 'Alpha Testing', percentage: 30 },
      { title: 'Beta Launch', percentage: 30 },
      { title: 'Public Release', percentage: 20 }
    ],
    sampleText: 'Our innovative tech solution addresses a critical market gap by providing users with a seamless way to [specific value proposition]. With your support, we\'ll bring this technology to market.',
    prefilledFields: {
      basics: {
        category: 'technology',
        tags: ['startup', 'innovation', 'software']
      },
      story: {
        projectStory: '<p>We\'re developing a cutting-edge technology solution that addresses [specific problem] in the [target industry]. Our product helps users to [key functionality] while providing [unique advantages] over existing solutions.</p><p>Our team has extensive experience in [relevant background] and has been working on this technology for [time period]. We\'ve completed initial research and development, and we\'re now ready to scale our efforts to bring this solution to market.</p>',
        projectGoals: '<p>1. Complete development of our core technology</p><p>2. Conduct thorough testing with alpha and beta users</p><p>3. Refine the product based on user feedback</p><p>4. Launch the solution to the public market</p><p>5. Establish key partnerships for growth and distribution</p>',
        projectRisks: '<p>As with any technology venture, we face challenges in development timelines, market adoption, and competitive pressures. We\'ve mitigated these risks through careful planning, building a flexible architecture, and conducting extensive market research to validate demand.</p>'
      }
    }
  },
  {
    id: 'nonprofit-cause',
    name: 'Nonprofit Cause',
    icon: faHandHoldingHeart,
    color: '#dc3545',
    description: 'Raise funds for your nonprofit organization\'s mission, whether it\'s humanitarian aid, environmental conservation, or social services.',
    category: 'Nonprofit',
    milestones: [
      { title: 'Initial Program Setup', percentage: 25 },
      { title: 'Community Outreach', percentage: 25 },
      { title: 'Service Implementation', percentage: 30 },
      { title: 'Impact Assessment', percentage: 20 }
    ],
    sampleText: 'Our organization is dedicated to [specific cause or mission]. With your support, we can expand our programs to help more people in need and create lasting positive change.',
    prefilledFields: {
      basics: {
        category: 'charity',
        tags: ['nonprofit', 'social-impact', 'community']
      },
      story: {
        projectStory: '<p>Our nonprofit organization is committed to addressing [specific social issue] in [target community/region]. For [time period], we\'ve been working to provide [services/support] to those in need.</p><p>This fundraising campaign will allow us to expand our reach and deepen our impact by [specific expansion plans]. The funds raised will directly support our programs that provide tangible benefits to [beneficiary group].</p>',
        projectGoals: '<p>1. Expand our services to reach [number] more people in need</p><p>2. Launch our new initiative focused on [specific program]</p><p>3. Improve our infrastructure to serve beneficiaries more effectively</p><p>4. Train [number] staff members and volunteers</p><p>5. Measure and report on our impact through comprehensive assessment</p>',
        projectRisks: '<p>Our organization faces challenges in securing sustainable funding, managing growth, and adapting to changing community needs. We address these through diversified funding sources, careful capacity planning, and ongoing community engagement to ensure our programs remain relevant and effective.</p>'
      }
    }
  },
  {
    id: 'educational-program',
    name: 'Educational Program',
    icon: faGraduationCap,
    color: '#6f42c1',
    description: 'Develop educational resources, workshops, courses, or training programs to empower learners of all ages.',
    category: 'Education',
    milestones: [
      { title: 'Curriculum Development', percentage: 30 },
      { title: 'Pilot Program', percentage: 20 },
      { title: 'Full Program Launch', percentage: 30 },
      { title: 'Evaluation & Expansion', percentage: 20 }
    ],
    sampleText: 'Our educational program will provide valuable skills and knowledge in [specific field] to [target audience]. We believe in making quality education accessible to all.',
    prefilledFields: {
      basics: {
        category: 'education',
        tags: ['learning', 'skills', 'development']
      },
      story: {
        projectStory: '<p>Our educational initiative aims to provide high-quality learning opportunities in [subject area] for [target audience]. We believe that education is a powerful tool for personal growth and community development.</p><p>Through this program, participants will gain valuable knowledge and skills in [specific areas], taught by experienced instructors using engaging and effective teaching methods. Our curriculum is designed to be [relevant characteristics, e.g., practical, accessible, innovative].</p>',
        projectGoals: '<p>1. Develop a comprehensive curriculum covering [key topics]</p><p>2. Create engaging learning materials and resources</p><p>3. Pilot the program with an initial cohort of [number] learners</p><p>4. Gather feedback and refine the program</p><p>5. Launch the full program and track educational outcomes</p>',
        projectRisks: '<p>Challenges in educational programs can include participant retention, ensuring quality instruction, and measuring learning outcomes. We\'ve designed our program with these considerations in mind, incorporating interactive elements, rigorous instructor training, and comprehensive assessment methods to ensure success.</p>'
      }
    }
  },
  {
    id: 'creative-project',
    name: 'Creative Project',
    icon: faPalette,
    color: '#fd7e14',
    description: 'Fund your artistic vision, whether it\'s a film, music album, book, performance, or visual art installation.',
    category: 'Creative',
    milestones: [
      { title: 'Project Development', percentage: 25 },
      { title: 'Production Phase', percentage: 40 },
      { title: 'Post-Production', percentage: 20 },
      { title: 'Release & Distribution', percentage: 15 }
    ],
    sampleText: 'I\'m creating [type of creative work] that explores [themes or concepts]. This project represents my vision as an artist and will resonate with audiences through its [unique qualities].',
    prefilledFields: {
      basics: {
        category: 'arts',
        tags: ['creative', 'art', 'culture']
      },
      story: {
        projectStory: '<p>As an artist, I\'m passionate about creating work that [artistic vision or purpose]. My new project, [project name], is a [medium] that explores [themes and concepts] through [artistic approach].</p><p>This creative work draws inspiration from [influences] while bringing a fresh perspective through [unique elements]. The completed project will [intended impact or experience for the audience].</p>',
        projectGoals: '<p>1. Complete the creative development and planning phase</p><p>2. Execute the production process with high artistic standards</p><p>3. Finalize all elements in post-production</p><p>4. Share the work through [exhibition/publishing/distribution methods]</p><p>5. Engage with audiences through [promotional or interactive elements]</p>',
        projectRisks: '<p>Creative projects often face challenges in production timelines, budget constraints, and distribution hurdles. I\'ve prepared for these by developing detailed production schedules, building in contingencies, and researching distribution channels to ensure the project reaches its intended audience.</p>'
      }
    }
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    icon: faStore,
    color: '#20c997',
    description: 'Bring your new physical product to market, from prototype and manufacturing to delivery and customer support.',
    category: 'Product',
    milestones: [
      { title: 'Final Prototype & Testing', percentage: 20 },
      { title: 'Manufacturing Setup', percentage: 30 },
      { title: 'Initial Production Run', percentage: 30 },
      { title: 'Fulfillment & Distribution', percentage: 20 }
    ],
    sampleText: 'We\'ve designed an innovative product that solves [specific problem] for [target market]. With your support, we can finalize production and deliver this solution to customers worldwide.',
    prefilledFields: {
      basics: {
        category: 'product',
        tags: ['innovation', 'manufacturing', 'consumer']
      },
      story: {
        projectStory: '<p>We\'ve developed a revolutionary product that addresses [specific need or problem] for [target market]. After extensive research and development, we\'ve created a prototype that demonstrates the product\'s functionality and benefits.</p><p>Our [product name/type] offers [key features and benefits] that set it apart from existing solutions. We\'ve validated market demand through [research methods] and received enthusiastic feedback from early testers.</p>',
        projectGoals: '<p>1. Finalize the product design and engineering</p><p>2. Set up manufacturing partnerships and quality control</p><p>3. Complete an initial production run</p><p>4. Establish logistics and fulfillment systems</p><p>5. Deliver products to backers and enter the broader market</p>',
        projectRisks: '<p>Product development involves challenges in manufacturing, supply chain management, and market acceptance. We\'ve mitigated these risks by partnering with experienced manufacturers, establishing backup suppliers, and thoroughly testing our product with potential users to ensure it meets their needs.</p>'
      }
    }
  },
  {
    id: 'game-development',
    name: 'Game Development',
    icon: faGamepad,
    color: '#6610f2',
    description: 'Fund your video game, board game, or interactive experience from concept to release, building an engaged community along the way.',
    category: 'Gaming',
    milestones: [
      { title: 'Game Design Completion', percentage: 20 },
      { title: 'Core Development', percentage: 30 },
      { title: 'Beta Testing', percentage: 30 },
      { title: 'Release & Support', percentage: 20 }
    ],
    sampleText: 'We\'re creating an innovative [game type] that offers players a unique experience through [key gameplay features]. Our talented team brings together expertise in design, programming, art, and storytelling.',
    prefilledFields: {
      basics: {
        category: 'games',
        tags: ['gaming', 'interactive', 'entertainment']
      },
      story: {
        projectStory: '<p>Our game studio is developing [game name/concept], a [genre] game that offers players [key gameplay experience]. The game features [unique mechanics or innovations] that create a fresh and engaging experience.</p><p>Players will [what players do in the game] while experiencing [narrative or progression elements]. Our art style is [description of visual approach], complemented by [audio/music approach] to create an immersive world.</p>',
        projectGoals: '<p>1. Complete game design documentation and assets</p><p>2. Develop core game systems and features</p><p>3. Conduct thorough beta testing with player feedback</p><p>4. Polish and optimize the final game</p><p>5. Launch on [platforms] with post-release support</p>',
        projectRisks: '<p>Game development comes with challenges in scope management, technical hurdles, and market competition. We\'ve prepared by creating a detailed development roadmap, building an experienced team, and focusing on our unique value proposition to stand out in the market.</p>'
      }
    }
  },
  {
    id: 'research-project',
    name: 'Research Project',
    icon: faLightbulb,
    color: '#ffc107',
    description: 'Secure funding for scientific, academic, or field research to advance knowledge and discover solutions to complex problems.',
    category: 'Research',
    milestones: [
      { title: 'Research Setup & Planning', percentage: 20 },
      { title: 'Data Collection Phase', percentage: 30 },
      { title: 'Analysis & Findings', percentage: 30 },
      { title: 'Publication & Dissemination', percentage: 20 }
    ],
    sampleText: 'Our research aims to investigate [research question or topic] through rigorous methodology. The findings will contribute to our understanding of [field or issue] and potentially lead to [applications or impacts].',
    prefilledFields: {
      basics: {
        category: 'science',
        tags: ['research', 'innovation', 'discovery']
      },
      story: {
        projectStory: '<p>Our research team is investigating [research subject] to advance our understanding of [broader field or phenomenon]. This project addresses the critical knowledge gap regarding [specific issue or question] through [methodological approach].</p><p>The research builds on [previous work or foundational knowledge] while introducing [novel elements or approaches]. Our team brings expertise in [relevant disciplines or methods], ensuring a rigorous and credible investigation.</p>',
        projectGoals: '<p>1. Establish the research infrastructure and protocols</p><p>2. Collect comprehensive data through [methods]</p><p>3. Analyze findings using [analytical approaches]</p><p>4. Document and publish results for peer review</p><p>5. Disseminate findings to relevant stakeholders and the public</p>',
        projectRisks: '<p>Research projects face uncertainties in data collection, methodological challenges, and interpretation complexities. We\'ve designed our approach with appropriate contingencies, multiple methodological approaches where feasible, and engagement with expert advisors to ensure scientific rigor and validity.</p>'
      }
    }
  },
  {
    id: 'ai-project',
    name: 'AI & ML Project',
    icon: faRobot,
    color: '#17a2b8',
    description: 'Develop artificial intelligence or machine learning solutions that solve real-world problems and push technological boundaries.',
    category: 'Technology',
    milestones: [
      { title: 'Algorithm Development', percentage: 25 },
      { title: 'Data Collection & Training', percentage: 30 },
      { title: 'System Integration', percentage: 25 },
      { title: 'Deployment & Refinement', percentage: 20 }
    ],
    sampleText: 'Our AI solution leverages machine learning to [specific application] in [industry or domain]. We\'re developing cutting-edge algorithms that improve upon existing methods in terms of [performance metrics].',
    prefilledFields: {
      basics: {
        category: 'technology',
        tags: ['artificial-intelligence', 'machine-learning', 'data-science']
      },
      story: {
        projectStory: '<p>We\'re developing an advanced AI system that applies [specific AI/ML techniques] to solve [problem] in [industry/domain]. Our approach overcomes limitations in existing solutions by [key innovations or improvements].</p><p>The technology leverages [data types/sources] and employs [algorithms/methods] to deliver [specific outcomes or capabilities]. We\'ve already demonstrated promising results in [preliminary tests or proofs of concept].</p>',
        projectGoals: '<p>1. Refine our core algorithms and model architecture</p><p>2. Build our dataset and training infrastructure</p><p>3. Optimize performance to meet or exceed [specific metrics]</p><p>4. Integrate the AI system with [applications or platforms]</p><p>5. Deploy the solution and gather feedback for continuous improvement</p>',
        projectRisks: '<p>AI projects involve challenges in data quality, computational requirements, and real-world performance. We\'ve addressed these by implementing robust data governance, designing scalable architecture, and establishing clear evaluation methods to ensure our solution delivers reliable results in practical applications.</p>'
      }
    }
  },
  {
    id: 'startup-funding',
    name: 'Startup Funding',
    icon: faChartLine,
    color: '#6c757d',
    description: 'Secure seed funding for your early-stage startup to develop your minimum viable product, build your team, and reach market fit.',
    category: 'Business',
    milestones: [
      { title: 'MVP Development', percentage: 30 },
      { title: 'Initial Market Traction', percentage: 25 },
      { title: 'Team Expansion', percentage: 20 },
      { title: 'Growth & Scaling', percentage: 25 }
    ],
    sampleText: 'Our startup is building [product/service] for [target market], addressing the underserved need for [value proposition]. With this funding, we\'ll bring our vision to market and scale our operations.',
    prefilledFields: {
      basics: {
        category: 'business',
        tags: ['startup', 'entrepreneurship', 'innovation']
      },
      story: {
        projectStory: '<p>Our startup is developing [product/service] to address a significant opportunity in the [industry/market]. We\'ve identified a clear market gap: [problem description] that affects [target customers], creating demand for a solution that provides [key benefits].</p><p>Our founding team brings together expertise in [relevant skills/experience], positioning us to execute effectively on this vision. We\'ve already achieved [early traction or milestones] and are now ready to accelerate our growth.</p>',
        projectGoals: '<p>1. Complete development of our minimum viable product</p><p>2. Acquire our first [number] paying customers</p><p>3. Expand our team with key hires in [roles]</p><p>4. Establish market presence and brand recognition</p><p>5. Build infrastructure for scaling operations</p>',
        projectRisks: '<p>Startups face risks in product-market fit, cash flow management, and competitive positioning. We\'re mitigating these through rapid iteration based on customer feedback, efficient resource allocation, and continuous market analysis to stay ahead of trends and competition.</p>'
      }
    }
  },
  {
    id: 'crypto',
    name: 'Crypto Project',
    icon: faChartLine,
    category: 'Technology',
    description: 'Launch or expand your cryptocurrency or blockchain project',
    sampleText: 'Our innovative blockchain solution addresses real-world problems by providing a decentralized platform for secure and transparent transactions. With this funding, we will complete development, security audits, and expand our user base.',
    prefilledFields: {
      basics: {
        category: 'defi',
        tags: ['blockchain', 'crypto', 'defi']
      },
      story: {
        projectGoals: '<h3>Project Goals</h3><ul><li>Complete platform development</li><li>Conduct comprehensive security audits</li><li>Launch mainnet</li><li>Expand user adoption</li></ul>',
        projectTeam: '<h3>Our Experienced Team</h3><p>Our team consists of blockchain developers, security experts, and business professionals with years of experience in the cryptocurrency space.</p>',
        projectRisks: '<h3>Risks & Challenges</h3><p>As with any blockchain project, we face regulatory uncertainty, competition from established platforms, and technical challenges. We have mitigated these risks by:</p><ul><li>Consulting with legal experts on compliance</li><li>Differentiating our product with unique features</li><li>Building a robust testing framework</li></ul>'
      }
    }
  },
  {
    id: 'charity',
    name: 'Charity Initiative',
    icon: faHandHoldingHeart,
    category: 'Nonprofit',
    description: 'Raise funds for a charitable cause or nonprofit organization',
    sampleText: 'Our mission is to make a meaningful difference in the lives of those in need. This campaign will fund our efforts to provide essential services, support, and resources to underserved communities.',
    prefilledFields: {
      basics: {
        category: 'charity',
        tags: ['nonprofit', 'charity', 'humanitarian']
      },
      story: {
        projectGoals: '<h3>Campaign Goals</h3><ul><li>Provide direct aid to communities in need</li><li>Build sustainable support systems</li><li>Create lasting positive impact</li></ul>',
        projectTeam: '<h3>Our Dedicated Team</h3><p>Our team consists of experienced nonprofit professionals, community organizers, and passionate volunteers committed to making a difference.</p>',
        projectRisks: '<h3>Challenges We Face</h3><p>Nonprofit initiatives often face logistical difficulties, funding sustainability concerns, and scaling challenges. We address these through:</p><ul><li>Strong local partnerships</li><li>Transparent fund management</li><li>A phased implementation approach</li></ul>'
      }
    }
  },
  {
    id: 'green',
    name: 'Green Initiative',
    icon: faLeaf,
    category: 'Environment',
    description: 'Fund environmental projects and sustainability initiatives',
    sampleText: 'Our environmental project aims to address pressing ecological challenges through innovative solutions. With your support, we will implement sustainable practices that protect our planet for future generations.',
    prefilledFields: {
      basics: {
        category: 'environment',
        tags: ['sustainability', 'green', 'climate']
      },
      story: {
        projectGoals: '<h3>Environmental Goals</h3><ul><li>Reduce carbon footprint</li><li>Implement sustainable practices</li><li>Protect natural resources</li></ul>',
        projectTeam: '<h3>Our Green Team</h3><p>Our team includes environmental scientists, sustainability experts, and dedicated conservationists with proven track records in ecological initiatives.</p>',
        projectRisks: '<h3>Environmental Challenges</h3><p>Environmental projects face complex regulatory landscapes, measurement difficulties, and resistance to change. We mitigate these by:</p><ul><li>Partnering with established organizations</li><li>Using scientific metrics to track impact</li><li>Engaging communities through education</li></ul>'
      }
    }
  },
  {
    id: 'tech',
    name: 'Tech Startup',
    icon: faLaptopCode,
    category: 'Technology',
    description: 'Launch your tech product or web3 application',
    sampleText: 'Our innovative technology solves real problems for users through cutting-edge development. This funding will help us complete product development, scale our infrastructure, and bring our solution to market.',
    prefilledFields: {
      basics: {
        category: 'technology',
        tags: ['startup', 'innovation', 'tech']
      },
      story: {
        projectGoals: '<h3>Startup Milestones</h3><ul><li>Complete MVP development</li><li>Launch beta testing</li><li>Scale infrastructure</li><li>Acquire initial users</li></ul>',
        projectTeam: '<h3>Founding Team</h3><p>Our founding team brings together technical expertise, business acumen, and industry experience from leading companies in the technology sector.</p>',
        projectRisks: '<h3>Startup Risks</h3><p>As a technology startup, we face development challenges, market competition, and scaling issues. Our mitigation strategies include:</p><ul><li>Agile development methodology</li><li>Continuous user feedback integration</li><li>Flexible go-to-market strategy</li></ul>'
      }
    }
  },
  {
    id: 'art',
    name: 'Creative Project',
    icon: faPalette,
    category: 'Arts',
    description: 'Fund your film, music, art or other creative endeavor',
    sampleText: 'This creative project explores new artistic expressions and pushes boundaries in the digital art space. With your support, we can bring this vision to life and share it with audiences worldwide.',
    prefilledFields: {
      basics: {
        category: 'arts',
        tags: ['creative', 'art', 'digital']
      },
      story: {
        projectGoals: '<h3>Creative Vision</h3><ul><li>Complete artistic production</li><li>Exhibit or distribute the work</li><li>Engage with the community</li></ul>',
        projectTeam: '<h3>Creative Team</h3><p>Our team consists of established artists, designers, and producers with experience in creating compelling and meaningful creative works.</p>',
        projectRisks: '<h3>Creative Challenges</h3><p>Creative projects often face production delays, budget constraints, and distribution challenges. We address these through:</p><ul><li>Detailed production planning</li><li>Conservative budgeting</li><li>Pre-arranged exhibition opportunities</li></ul>'
      }
    }
  },
  {
    id: 'education',
    name: 'Educational Initiative',
    icon: faGraduationCap,
    category: 'Education',
    description: 'Fund educational programs, resources or technologies',
    sampleText: 'Our educational initiative aims to provide quality learning opportunities and resources to those who need them most. This campaign will fund the development and distribution of educational materials and programs.',
    prefilledFields: {
      basics: {
        category: 'education',
        tags: ['learning', 'education', 'development']
      },
      story: {
        projectGoals: '<h3>Educational Goals</h3><ul><li>Develop learning materials</li><li>Train educators</li><li>Distribute resources</li><li>Measure educational impact</li></ul>',
        projectTeam: '<h3>Education Team</h3><p>Our team includes experienced educators, curriculum developers, and education technology specialists dedicated to improving learning outcomes.</p>',
        projectRisks: '<h3>Educational Challenges</h3><p>Educational initiatives face adoption barriers, measurement complexities, and sustainability issues. Our approach includes:</p><ul><li>Stakeholder engagement from day one</li><li>Comprehensive impact assessment framework</li><li>Long-term sustainability planning</li></ul>'
      }
    }
  },
  {
    id: 'community',
    name: 'Community Project',
    icon: faUserGroup,
    category: 'Community',
    description: 'Raise funds for local initiatives and community projects',
    sampleText: 'This community-driven project aims to strengthen local connections and improve quality of life for residents. With your support, we will create spaces and programs that bring people together.',
    prefilledFields: {
      basics: {
        category: 'community',
        tags: ['local', 'community', 'social']
      },
      story: {
        projectGoals: '<h3>Community Objectives</h3><ul><li>Create community spaces</li><li>Develop local programs</li><li>Foster community connections</li></ul>',
        projectTeam: '<h3>Community Leaders</h3><p>Our team consists of local leaders, community organizers, and residents who are deeply invested in the future of our neighborhood.</p>',
        projectRisks: '<h3>Community Challenges</h3><p>Community projects often face permitting issues, volunteer turnover, and maintenance concerns. We address these through:</p><ul><li>Early engagement with local authorities</li><li>Broad volunteer recruitment</li><li>Sustainable maintenance planning</li></ul>'
      }
    }
  },
  {
    id: 'gaming',
    name: 'Gaming Project',
    icon: faGamepad,
    category: 'Gaming',
    description: 'Fund your game development or gaming-related initiative',
    sampleText: 'Our gaming project combines innovative gameplay, stunning visuals, and compelling storytelling. This funding will help us complete development, testing, and launch our game to players worldwide.',
    prefilledFields: {
      basics: {
        category: 'gaming',
        tags: ['games', 'development', 'entertainment']
      },
      story: {
        projectGoals: '<h3>Game Development Goals</h3><ul><li>Complete core gameplay</li><li>Finalize art assets</li><li>Conduct thorough testing</li><li>Launch on target platforms</li></ul>',
        projectTeam: '<h3>Development Team</h3><p>Our team includes experienced game developers, artists, sound designers, and QA specialists with a track record of successful game releases.</p>',
        projectRisks: '<h3>Development Challenges</h3><p>Game development projects face technical hurdles, scope creep, and competitive market pressures. Our strategies include:</p><ul><li>Modular development approach</li><li>Regular milestone reviews</li><li>Early community engagement for feedback</li></ul>'
      }
    }
  }
];

const CampaignTemplateSelector = ({ show, onHide, onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get all unique categories
  const categories = ['all', ...new Set(CAMPAIGN_TEMPLATES.map(template => template.category))];
  
  // Filter templates based on search and category
  const filteredTemplates = CAMPAIGN_TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === '' || 
                          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onHide();
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="template-selector-modal">
      <Modal.Header closeButton>
        <Modal.Title>Choose a Campaign Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="filter-container mb-4">
          <Row>
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </div>
        
        <div className="templates-grid">
          <Row>
            {filteredTemplates.map(template => (
              <Col md={6} lg={4} key={template.id} className="mb-4">
                <Card 
                  className="template-card h-100"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div 
                    className="template-icon-container"
                    style={{ backgroundColor: template.color }}
                  >
                    <FontAwesomeIcon icon={template.icon} size="2x" className="template-icon" />
                  </div>
                  <Card.Body>
                    <Card.Title>{template.name}</Card.Title>
                    <Badge bg="secondary" className="mb-2">{template.category}</Badge>
                    <Card.Text>{template.description}</Card.Text>
                    
                    <div className="milestones-preview">
                      <small className="text-muted">Suggested Milestones:</small>
                      {template.milestones.slice(0, 2).map((milestone, index) => (
                        <div key={index} className="milestone-item">
                          {milestone.title} ({milestone.percentage}%)
                        </div>
                      ))}
                      {template.milestones.length > 2 && (
                        <div className="milestone-item text-muted">
                          + {template.milestones.length - 2} more
                        </div>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-center">
                    <Button variant="outline-primary" size="sm">Use This Template</Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
            
            {/* Custom template option */}
            <Col md={6} lg={4} className="mb-4">
              <Card 
                className="template-card h-100 custom-template-card"
                onClick={() => onHide()}
              >
                <div className="template-icon-container" style={{ backgroundColor: '#6c757d' }}>
                  <FontAwesomeIcon icon={faPlus} size="2x" className="template-icon" />
                </div>
                <Card.Body className="text-center">
                  <Card.Title>Start from Scratch</Card.Title>
                  <Card.Text>
                    Create a completely custom campaign with your own structure and content.
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="text-center">
                  <Button variant="outline-secondary" size="sm">Custom Campaign</Button>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CampaignTemplateSelector; 