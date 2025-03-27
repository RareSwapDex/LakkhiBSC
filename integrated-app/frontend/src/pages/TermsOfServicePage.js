import React from 'react';
import { Container } from 'react-bootstrap';

const TermsOfServicePage = () => {
  return (
    <Container className="my-5">
      <h1 className="mb-4">Terms of Service</h1>
      
      <p>Last updated: March 28, 2023</p>
      
      <h2 className="mt-4">1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Lakkhi Fund platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        If you do not agree with any of these terms, you are prohibited from using or accessing this site.
      </p>
      
      <h2 className="mt-4">2. Use License</h2>
      <p>
        Permission is granted to temporarily access the materials on Lakkhi Fund's website for personal, non-commercial use only.
        This is the grant of a license, not a transfer of title, and under this license you may not:
      </p>
      <ul>
        <li>Modify or copy the materials</li>
        <li>Use the materials for any commercial purpose</li>
        <li>Attempt to decompile or reverse engineer any software contained on the website</li>
        <li>Remove any copyright or other proprietary notations from the materials</li>
        <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
      </ul>
      
      <h2 className="mt-4">3. Disclaimer</h2>
      <p>
        The materials on Lakkhi Fund's website are provided on an 'as is' basis. Lakkhi Fund makes no warranties, 
        expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
        implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
      </p>
      
      <h2 className="mt-4">4. Limitations</h2>
      <p>
        In no event shall Lakkhi Fund or its suppliers be liable for any damages (including, without limitation, 
        damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
        to use the materials on Lakkhi Fund's website, even if Lakkhi Fund or a Lakkhi Fund authorized representative 
        has been notified orally or in writing of the possibility of such damage.
      </p>
      
      <h2 className="mt-4">5. Accuracy of Materials</h2>
      <p>
        The materials appearing on Lakkhi Fund's website could include technical, typographical, or photographic errors. 
        Lakkhi Fund does not warrant that any of the materials on its website are accurate, complete or current. 
        Lakkhi Fund may make changes to the materials contained on its website at any time without notice.
      </p>
      
      <h2 className="mt-4">6. Links</h2>
      <p>
        Lakkhi Fund has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. 
        The inclusion of any link does not imply endorsement by Lakkhi Fund of the site. Use of any such linked website is at the user's own risk.
      </p>
      
      <h2 className="mt-4">7. Modifications</h2>
      <p>
        Lakkhi Fund may revise these terms of service for its website at any time without notice. 
        By using this website you are agreeing to be bound by the then current version of these terms of service.
      </p>
      
      <h2 className="mt-4">8. Governing Law</h2>
      <p>
        These terms and conditions are governed by and construed in accordance with the laws of Singapore 
        and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
      </p>
    </Container>
  );
};

export default TermsOfServicePage; 