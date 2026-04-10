import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p>
            I A V Global Event Organizers LLC ("We") are committed to protecting and respecting your privacy.
          </p>

          <p>
            This policy sets out the basis on which we will process any personal data we collect from you, or that you provide to us. Please read the following carefully to understand our views and practices regarding your personal data and how we will treat it. By visiting www.iamverse.com, you are accepting and consenting to the practices described in this policy.
          </p>

          <p>
            For the purpose of the Data Protection Act 1998 (the "Act"), the data controller is I A V Global Event Organizers LLC of Warehouse #5 Plot #0364-0389, Al Quoz Industrial Area 1, Dubai.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Information we may collect from you</h2>

          <p>We may collect and process the following data about you:</p>

          <h3 className="text-xl font-medium mt-6 mb-3">Information you give us</h3>
          <p>
            You may give us information about you by filling in forms on our site, at one of our events or by corresponding with us by phone, e-mail or otherwise. This includes information you provide when you register to use our site, book a place at one of our events, purchase one of our products or services, participate in discussion boards or other social media functions or enter a competition, promotion or survey and when you report a problem with our site. The information you give us may include your name, address, e-mail address and phone number, financial and credit card information, personal description and photograph, key dates provided by you in order to use our service.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Information we collect about you</h3>
          <p>With regard to each of your visits to our site we may automatically collect the following information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Technical information, including the Internet protocol (IP) address used to connect your computer to the Internet, your login information, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform;</li>
            <li>Information about your visit, including the full Uniform Resource Locators (URL) clickstream to, through and from our site (including date and time); products you viewed or searched for; page response times, download errors, length of visits to certain pages, page interaction information (such as scrolling, clicks, and mouse-overs), and methods used to browse away from the page and any phone number used to call our customer service number.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">Information we receive from other sources</h3>
          <p>
            We may receive information about you if you use one of our products or services or attend one of our events. We are also working closely with third parties (including, for example, business partners, sub-contractors in technical, and payment services, advertising networks, analytics providers, search information providers) and may receive information about you from them.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
          <p>
            Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Uses made of the information</h2>
          <p>We use information held about you in the following ways:</p>

          <h3 className="text-xl font-medium mt-6 mb-3">Information you give to us</h3>
          <p>We will use this information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To carry out our obligations arising from any contracts entered into between you and us and to provide you with the information, products and services that you request from us;</li>
            <li>To provide you, or permit selected third parties (including the people or organisations presenting material at one of our events or in a webinar) to provide you with information about other goods and services we offer that are similar to those that you have already purchased or enquired about;</li>
            <li>To notify you about changes to our service;</li>
            <li>To ensure that content from our site is presented in the most effective manner for you and for your computer.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">Information we collect about you</h3>
          <p>We will use this information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To administer our site and for internal operations, including troubleshooting, data analysis, testing, research, statistical and survey purposes;</li>
            <li>To improve our site to ensure that content is presented in the most effective manner for you and for your computer;</li>
            <li>To allow you to participate in interactive features of our service, when you choose to do so;</li>
            <li>As part of our efforts to keep our site safe and secure;</li>
            <li>To measure or understand the effectiveness of advertising we serve to you and others, and to deliver relevant advertising to you;</li>
            <li>To make suggestions and recommendations to you and other users of our site about goods or services that may interest you or them.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Disclosure of your information</h2>
          <p>
            We may share your personal information with any member of our group, which means our subsidiaries, our ultimate holding company and its subsidiaries, as defined in section 1159 of the UK Companies Act 2006.
          </p>
          <p>We may share your information with selected third parties including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Business partners, suppliers and subcontractors for the performance of any contract we enter into with them or you;</li>
            <li>Analytics and search engine providers that assist us in the improvement and optimisation of our site.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Where we store your personal data</h2>
          <p>
            The data that we collect from you may be transferred to, and stored at, a destination outside the European Economic Area ("EEA"). It may also be processed by staff operating outside the EEA who work for us or for one of our suppliers. By submitting your personal data, you agree to this transfer, storing or processing. We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this privacy policy.
          </p>
          <p>
            All information you provide to us is stored on secure servers. Where we have given you (or where you have chosen) a password which enables you to access certain parts of our site, you are responsible for keeping this password confidential. We ask you not to share a password with anyone.
          </p>
          <p>
            Unfortunately, the transmission of information via the internet is not completely secure. Although we will do our best to protect your personal data, we cannot guarantee the security of your data transmitted to our site; any transmission is at your own risk. Once we have received your information, we will use strict procedures and security features to try to prevent unauthorised access.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Your rights</h2>
          <p>
            You have the right to ask us not to process your personal data for marketing purposes. You can exercise your right to prevent such processing by checking certain boxes on the forms we use to collect your data. You can also exercise the right at any time by contacting us at{" "}
            <a href="mailto:team@iamverse.com" className="text-primary hover:underline">team@iamverse.com</a>.
          </p>
          <p>
            Our site may, from time to time, contain links to and from the websites of our partner networks, advertisers and affiliates. If you follow a link to any of these websites, please note that these websites have their own privacy policies and that we do not accept any responsibility or liability for these policies. Please check these policies before you submit any personal data to these websites.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Access to information</h2>
          <p>
            The Act gives you the right to access information held about you. Your right of access can be exercised in accordance with the Act. Any access request may be subject to a fee of £10 to meet our costs in providing you with details of the information we hold about you.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to our privacy policy</h2>
          <p>
            Any changes we may make to our privacy policy in the future will be posted on this page and, where appropriate, notified to you by email. Please check back frequently to see any updates or changes to our privacy policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
          <p>
            Questions, comments and requests regarding this privacy policy are welcomed and should be addressed to{" "}
            <a href="mailto:team@iamverse.com" className="text-primary hover:underline">team@iamverse.com</a>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
