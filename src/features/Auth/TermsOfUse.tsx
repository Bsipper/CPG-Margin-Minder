import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './TermsOfUse.module.css';

export function TermsOfUse() {
    const { acceptTerms, logout } = useAuth();
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        // User has scrolled within 20px of the bottom
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
            setScrolledToBottom(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Terms of Use</h1>
                    <p>Please review and accept our Terms of Use to continue to CPG Margin Minder.</p>
                </div>

                <div className={styles.termsBox} onScroll={handleScroll}>
                    <p><strong>Last Updated: March 8, 2026</strong></p>

                    <p>Welcome to www.cpgfieldsolutions.com (the "Website"), owned and operated by CPG Field Solutions ("Company," "we," "us," or "our"). These Terms of Use ("Terms") govern your access to and use of our Website and any of its content, features, and services (collectively, the "Services").</p>

                    <p>Please read these Terms carefully before using our Services. By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy, which is incorporated by reference into these Terms. If you do not agree to these Terms, you may not access or use our Services.</p>

                    <p><strong>1. Eligibility and Age Requirement</strong><br />
                        The Services are not intended for use by children under the age of 13. By using the Services, you represent and warrant that you are at least 13 years of age. If you are under 18, you may use the Services only with the involvement of a parent or guardian who agrees to be bound by these Terms.</p>

                    <p><strong>2. Definitions</strong><br />
                        In these Terms, "Content" refers to all text, graphics, images, music, software, audio, video, works of authorship of any kind, and information or other materials that are posted, generated, provided, or otherwise made available through the Services. A "User" is any person who accesses or uses the Services. "User Content" is any Content that Users (including you) provide to be made available through the Services.</p>

                    <p><strong>3. Changes to Terms or Services</strong><br />
                        We may modify the Terms at any time, in our sole discretion. If we do so, we’ll let you know either by posting the modified Terms on the Website or through other communications. It’s important that you review the Terms whenever we modify them because if you continue to use the Services after we have posted modified Terms on the Website, you are indicating to us that you agree to be bound by the modified Terms. If you don’t agree to be bound by the modified Terms, then you may not use the Services anymore. Because our Services are evolving over time we may change or discontinue all or any part of the Services, at any time and without notice, at our sole discretion.</p>

                    <p><strong>4. User Accounts and Electronic Communications</strong><br />
                        To access certain features of our Services, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account, whether or not you have authorized such activities or actions. You will notify us immediately of any unauthorized use of your account.</p>
                    <p>By creating an account, you consent to receive electronic communications from us (e.g., via email or by posting notices to the Services). These communications may include notices about your account (e.g., payment authorizations, password changes and other transactional information) and are part of your relationship with us.</p>

                    <p><strong>5. User Conduct and Acceptable Use</strong><br />
                        You agree not to use the Services for any purpose that is prohibited by these Terms or by applicable law. You shall not, and shall not permit any third party to, take any action or upload, download, post, submit, or otherwise distribute or facilitate distribution of any Content on or through the Service, including without limitation any User Content, that infringes any patent, trademark, trade secret, copyright, right of publicity or other right of any other person or entity or violates any law or contractual duty; that you know is false, misleading, untruthful or inaccurate; that is unlawful, threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, invasive of another's privacy, tortious, obscene, vulgar, pornographic, offensive, profane, contains or depicts nudity, contains or depicts sexual activity, or is otherwise inappropriate as determined by us in our sole discretion; that constitutes unauthorized or unsolicited advertising, junk or bulk e-mail ("spamming"); that involves commercial activities and/or sales without our prior written consent such as contests, sweepstakes, barter, advertising, or pyramid schemes; that impersonates any person or entity, including any of our employees or representatives; or that includes anyone's identification documents or sensitive financial information.</p>

                    <p><strong>6. Intellectual Property Rights</strong><br />
                        Unless otherwise indicated, the Services and all content and other materials on the Services, including, without limitation, the Company logo, and all designs, text, graphics, pictures, information, data, software, sound files, other files and the selection and arrangement thereof (collectively, the "Company Content") are the proprietary property of the Company or our licensors or users and are protected by U.S. and international copyright laws. You are granted a limited, non-sublicensable license to access and use the Services and Company Content for your personal use only.</p>

                    <p><strong>7. User Content and Data Collection</strong><br />
                        We may permit you to post, upload, publish, submit or transmit User Content. By making available any User Content on or through the Services, you hereby grant to Company a worldwide, irrevocable, perpetual, non-exclusive, transferable, royalty-free license, with the right to sublicense, to use, copy, adapt, modify, prepare derivative works from, distribute, license, sell, transfer, publicly display, publicly perform, transmit, stream, broadcast, and otherwise exploit such User Content in any and all media, formats, and channels now known or hereafter developed, for any purpose whatsoever, without any compensation to you.</p>

                    <p>Our collection, use, and disclosure of your personal information is governed by our Privacy Policy, which is incorporated herein by reference. By using the Services, you consent to all actions taken by us with respect to your information in compliance with the Privacy Policy. This includes the collection of technical data, usage information, device information, location data, and information collected via cookies and other tracking technologies. You acknowledge and agree that we have the right to use this data for any lawful purpose, including, but not limited to, providing and improving the Services, conducting research and analysis, developing new products and features, and for marketing and advertising purposes.</p>

                    <p><strong>8. Third-Party Links</strong><br />
                        The Services may contain links to third-party websites or resources. We provide these links only as a convenience and are not responsible for the content, products, or services on or available from those websites or resources or links displayed on such websites. You acknowledge sole responsibility for and assume all risk arising from, your use of any third-party websites or resources.</p>

                    <p><strong>9. DMCA/Copyright Policy</strong><br />
                        We respect copyright law and expect our users to do the same. It is our policy to terminate in appropriate circumstances account holders who repeatedly infringe or are believed to be repeatedly infringing the rights of copyright holders. If you are a copyright owner, or are authorized to act on behalf of one, and you believe that your work has been copied in a way that constitutes copyright infringement, please submit your claim to us via the contact information below, with the subject line: "Copyright Infringement." Your claim must include the following information in writing (see 17 U.S.C 512(c)(3) for further detail): (1) a physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed; (2) identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works at that site; (3) identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material; (4) information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an electronic mail address at which you may be contacted; (5) a statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law; and (6) a statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</p>

                    <p><strong>10. Termination</strong><br />
                        We may terminate your access to and use of the Services, at our sole discretion, at any time and without notice to you. You may cancel your account at any time by sending an email to us at info@cpgfieldsolutions.com. Upon any termination, discontinuation or cancellation of Services or your Account, all provisions of these Terms which by their nature should survive will survive, including, without limitation, ownership provisions, warranty disclaimers, limitations of liability, and dispute resolution provisions.</p>

                    <p><strong>11. Disclaimers</strong><br />
                        THE SERVICES ARE PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND. WITHOUT LIMITING THE FOREGOING, WE EXPLICITLY DISCLAIM ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. We make no warranty that the Services will meet your requirements or be available on an uninterrupted, secure, or error-free basis. We make no warranty regarding the quality, accuracy, timeliness, truthfulness, completeness or reliability of any Content.</p>

                    <p><strong>12. Limitation of Liability</strong><br />
                        NEITHER COMPANY NOR ANY OTHER PARTY INVOLVED IN CREATING, PRODUCING, OR DELIVERING THE SERVICES WILL BE LIABLE FOR ANY INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA OR GOODWILL, SERVICE INTERRUPTION, COMPUTER DAMAGE OR SYSTEM FAILURE OR THE COST OF SUBSTITUTE SERVICES ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR FROM THE USE OF OR INABILITY TO USE THE SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT COMPANY HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, EVEN IF A LIMITED REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.<br /><br />
                        IN NO EVENT WILL COMPANY’S TOTAL LIABILITY ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR FROM THE USE OF OR INABILITY TO USE THE SERVICES EXCEED THE AMOUNTS YOU HAVE PAID TO COMPANY FOR USE OF THE SERVICES OR ONE HUNDRED DOLLARS ($100), IF YOU HAVE NOT HAD ANY PAYMENT OBLIGATIONS TO COMPANY, AS APPLICABLE.</p>

                    <p><strong>13. Indemnification</strong><br />
                        You agree to indemnify and hold harmless Company and its officers, directors, employees and agents, from and against any claims, disputes, demands, liabilities, damages, losses, and costs and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with (i) your access to or use of the Services or Content, (ii) your User Content, or (iii) your violation of these Terms.</p>

                    <p><strong>14. Governing Law, Dispute Resolution, and Arbitration</strong><br />
                        Governing Law. These Terms and any action related thereto will be governed by the laws of the State of New Jersey without regard to its conflict of laws provisions. The exclusive jurisdiction and venue of any action with respect to the subject matter of these Terms will be the state and federal courts located in Bergen County, New Jersey, and each of the parties hereto waives any objection to jurisdiction and venue in such courts.<br /><br />
                        Agreement to Arbitrate. You and Company agree that any dispute, claim or controversy arising out of or relating to these Terms or the breach, termination, enforcement, interpretation or validity thereof or the use of the Services or Content (collectively, “Disputes”) will be settled by binding arbitration administered by the American Arbitration Association (“AAA”) in accordance with its Consumer Arbitration Rules (the “AAA Rules”) then in effect, except as modified by this “Dispute Resolution” section. The Federal Arbitration Act will govern the interpretation and enforcement of this section. The arbitration will be conducted in Bergen County, New Jersey, unless you and Company agree otherwise.<br /><br />
                        Class Action Waiver. YOU AND COMPANY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. Further, unless both you and Company otherwise agree in writing, the arbitrator may not consolidate more than one person's claims, and may not otherwise preside over any form of a representative or class proceeding.</p>

                    <p><strong>15. State-Specific Provisions</strong><br />
                        For California Residents: If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them. In addition, under California Civil Code Section 1789.3, you may report complaints to the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs by contacting them in writing at 400 R Street, Sacramento, CA 95814, or by telephone at (800) 952-5210.<br /><br />
                        For Virginia Residents: If you are a Virginia resident, you have certain rights under the Virginia Consumer Data Protection Act (VCDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For New Jersey Residents: If you are a New Jersey resident, you have certain rights under the New Jersey Data Privacy Act (NJDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Colorado Residents: If you are a Colorado resident, you have certain rights under the Colorado Privacy Act (CPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Connecticut Residents: If you are a Connecticut resident, you have certain rights under the Connecticut Data Privacy Act (CTDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Texas Residents: If you are a Texas resident, you have certain rights under the Texas Data Privacy and Security Act (TDPSA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Oregon Residents: If you are an Oregon resident, you have certain rights under the Oregon Consumer Privacy Act (OCPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Montana Residents: If you are a Montana resident, you have certain rights under the Montana Consumer Data Privacy Act (MTCDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Utah Residents: If you are a Utah resident, you have certain rights under the Utah Consumer Privacy Act (UCPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Delaware Residents: If you are a Delaware resident, you have certain rights under the Delaware Personal Data Privacy Act (DPDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Iowa Residents: If you are an Iowa resident, you have certain rights under the Iowa Consumer Data Protection Act (ICDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Nebraska Residents: If you are a Nebraska resident, you have certain rights under the Nebraska Data Privacy Act (NDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For New Hampshire Residents: If you are a New Hampshire resident, you have certain rights under the New Hampshire Privacy Act (NHPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Tennessee Residents: If you are a Tennessee resident, you have certain rights under the Tennessee Information Protection Act (TIPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Minnesota Residents: If you are a Minnesota resident, you have certain rights under the Minnesota Consumer Data Privacy Act (MCDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Maryland Residents: If you are a Maryland resident, you have certain rights under the Maryland Online Data Privacy Act (MODPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Indiana Residents: If you are an Indiana resident, you have certain rights under the Indiana Consumer Data Protection Act (INCDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Kentucky Residents: If you are a Kentucky resident, you have certain rights under the Kentucky Consumer Data Protection Act (KCDPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Rhode Island Residents: If you are a Rhode Island resident, you have certain rights under the Rhode Island Data Transparency and Privacy Protection Act (RIDTPPA). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For Florida Residents: If you are a Florida resident, you have certain rights under the Florida Digital Bill of Rights (FDBR). Please review our Privacy Policy for a detailed description of your rights and how to exercise them.<br /><br />
                        For All Other States: Even if your state does not currently have a comprehensive data privacy law, you may still have certain rights under other applicable federal or state laws. We are committed to respecting the privacy of all our users and will comply with all applicable laws regarding data collection, use, and disclosure. This section will be updated as new state privacy laws come into effect. We encourage you to review this section periodically to stay informed of your rights.</p>

                    <p><strong>16. General Terms</strong><br />
                        These Terms constitute the entire and exclusive understanding and agreement between Company and you regarding the Services and Content, and these Terms supersede and replace any and all prior oral or written understandings or agreements between Company and you regarding the Services and Content. If for any reason a court of competent jurisdiction finds any provision of these Terms invalid or unenforceable, that provision will be enforced to the maximum extent permissible and the other provisions of these Terms will remain in full force and effect. You may not assign or transfer these Terms, by operation of law or otherwise, without Company’s prior written consent. Any attempt by you to assign or transfer these Terms, without such consent, will be null. Company may freely assign or transfer these Terms without restriction. Subject to the foregoing, these Terms will bind and inure to the benefit of the parties, their successors and permitted assigns. Any notices or other communications provided by Company under these Terms, including those regarding modifications to these Terms, will be given: (i) via email; or (ii) by posting to the Services. For notices made by e-mail, the date of receipt will be deemed the date on which such notice is transmitted.</p>

                    <p><strong>17. Contact Information</strong><br />
                        If you have any questions about these Terms, please contact us at:<br />
                        CPG Field Solutions<br />
                        Email: info@cpgfieldsolutions.com</p>

                    <p><strong>18. Cookies, Tracking Technologies, and Analytics</strong><br />
                        When you visit our Website, we may use cookies, web beacons, pixel tags, and other tracking technologies to automatically collect certain information about your device and browsing activity. This includes your IP address, browser type, operating system, referring URLs, and other technical information. We use this information to operate the Services, to improve your experience, and to analyze traffic. By using the Services, you consent to the use of these tracking technologies. For more information about how we use cookies and your choices, please see our Privacy Policy.</p>

                    <p><strong>19. Restrictions on Automated Data Collection and Use</strong><br />
                        You are strictly prohibited from using any automated means or form of scraping, crawling, or data mining to access, query, or otherwise collect information or content from the Website. This includes, but is not limited to, the use of any bots, spiders, or other automated devices, processes, or means to access the Services for any purpose, including monitoring or copying any of the material on the Website. You may not use any manual process to monitor or copy any of the material on the Website or for any other unauthorized purpose without our prior written consent. You agree not to use any device, software, or routine that interferes with the proper working of the Services. You are also prohibited from using the Services or any of its content for the purpose of training, developing, or improving any artificial intelligence (AI ) or machine learning models without our express prior written consent.</p>

                    <p><strong>20. Reverse Engineering and Other Prohibitions</strong><br />
                        You may not, and you agree not to or enable others to, copy, decompile, reverse engineer, disassemble, attempt to derive the source code of, decrypt, modify, or create derivative works of the Services or any part thereof.</p>

                    <p><strong>21. Data Aggregation, Anonymization, and Commercial Use</strong><br />
                        Notwithstanding anything to the contrary herein, you agree that we may collect, use, and disclose data and information related to your use of the Services for industry analysis, benchmarking, analytics, marketing, and other business purposes, provided that such data is aggregated and anonymized and does not identify you or any individual. We retain all intellectual property rights in such aggregated and anonymized data.</p>

                    <p><strong>22. Feedback</strong><br />
                        We welcome feedback, comments, and suggestions for improvements to the Services (“Feedback”). You can submit Feedback by emailing us at info@cpgfieldsolutions.com. You grant to us a non-exclusive, worldwide, perpetual, irrevocable, fully-paid, royalty-free, sublicensable, and transferable license under any and all intellectual property rights that you own or control to use, copy, modify, create derivative works based upon, and otherwise exploit the Feedback for any purpose.</p>

                    <p><strong>23. Force Majeure</strong><br />
                        We shall not be liable for any delay or failure to perform resulting from causes outside our reasonable control, including, but not limited to, acts of God, war, terrorism, riots, embargos, acts of civil or military authorities, fire, floods, accidents, strikes or shortages of transportation facilities, fuel, energy, labor or materials.</p>

                    <p><strong>24. No Waiver</strong><br />
                        Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative of CPG Field Solutions.</p>

                </div>

                <div className={styles.actions}>
                    <button className={styles.logoutBtn} onClick={logout}>Cancel & Sign Out</button>
                    <button
                        className={scrolledToBottom ? styles.acceptBtn : styles.acceptBtnDisabled}
                        onClick={acceptTerms}
                        disabled={!scrolledToBottom}
                        title={!scrolledToBottom ? "Please scroll to the bottom to accept" : undefined}
                    >
                        I Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
