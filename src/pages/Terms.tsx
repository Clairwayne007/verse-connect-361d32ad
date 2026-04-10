import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="font-medium">Please read all of the following terms and conditions carefully.</p>

          <p>
            So that we can accept your order and form a legally enforceable agreement without further requirement from you, it is essential for you to read these terms and conditions to make sure that they are satisfactory. If you are uncertain about anything please feel free to email us on{" "}
            <a href="mailto:team@iamverse.com" className="text-primary hover:underline">team@iamverse.com</a>
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Application</h2>
          <p>
            These Terms and Conditions will apply to the purchase of the services and goods by you (the Customer or you). We are I A V Global Event Organizers LLC, a company registered in Dubai, United Arab Emirates under number 1748702, License 1073845, whose registered office is at Unit #5 Plot #0364-0389, Al Quoz Industrial Area 1, Dubai, with email address{" "}
            <a href="mailto:team@iamverse.com" className="text-primary hover:underline">team@iamverse.com</a> (the Team or us or we).
          </p>
          <p>
            These are the terms on which we sell all Services to you. By ordering any of the Services, you agree to be bound by these Terms and Conditions. You can only purchase the Services and Goods from the Website or the Team if you are eligible to enter into a contract and are at least 18 years old.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Interpretation</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Consumer</strong> means an individual acting for purposes which are wholly or mainly outside his or her trade, business, craft or profession;</li>
            <li><strong>Contract</strong> means the legally-binding agreement between you and us for the supply of the Services;</li>
            <li><strong>Delivery Location</strong> means the Team's premises or other location where the Services are to be supplied, as set out in the Order;</li>
            <li><strong>Durable Medium</strong> means paper or email, or any other medium that allows information to be addressed personally to the recipient;</li>
            <li><strong>Goods</strong> means any goods that we supply to you with the Services;</li>
            <li><strong>Order</strong> means the Customer's order for the Services from the Supplier;</li>
            <li><strong>Privacy Policy</strong> means the terms which set out how we will deal with confidential and personal information received from you;</li>
            <li><strong>Services</strong> means the services advertised by the Team or on the Website;</li>
            <li><strong>Website</strong> means our website and other webpages on which the Services are advertised.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Services</h2>
          <p>
            The description of the Services and any Goods is as set out in the Website, catalogues, brochures or other forms of advertisement. Any description is for illustrative purposes only and there may be small discrepancies in the size and colour of any Goods supplied.
          </p>
          <p>
            In the case of Services and any Goods made to your special requirements, it is your responsibility to ensure that any information or specification you provide is accurate.
          </p>
          <p>
            All Services which appear on the Website or offered by the Team are subject to availability.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Customer Responsibilities</h2>
          <p>
            You must cooperate with us in all matters relating to the Services, provide us and our authorised employees and representatives with all information required to perform the Services and obtain any necessary licences and consents (unless otherwise agreed).
          </p>
          <p>
            Failure to comply with the above is a Customer default which entitles us to suspend performance of the Services until you remedy it or if you fail to remedy it following our request, we can terminate the Contract with immediate effect on providing written notice to you.
          </p>
          <p>
            While attending some of our events, you may be invited to take part in activities which could, potentially, result in serious personal injury. By booking a place at an event, you expressly accept and acknowledge that you do not have to take part in any such activity and that, if you do take part, you do so of your own free will and at your own risk.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Risk and Title</h2>
          <p>
            Risk of damage to, or loss of, any Goods will pass to you when the Goods are delivered to you.
          </p>
          <p>
            We own the intellectual property rights, including copyright, in any materials given to you in connection with the event you attend or any course you take part in, whether delivered in hard copy or electronically. This means that you must not copy or reproduce them in any format for the purpose of distributing them to anyone else, whether or not for payment.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Fees and Payment</h2>
          <p>
            The fees (Fees) for the Services, the price of any Goods (if not included in the Fees) and any additional delivery or other charges is set out on the Website at the date we accept the Order or such other price as we may agree in writing.
          </p>
          <p>
            Fees and charges include VAT at the rate applicable at the time of the Order.
          </p>
          <p>
            You can pay us in cash, by debit or credit card or by electronic bank transfer. We do not charge for handling debit or credit card payments.
          </p>
          <p>
            If payment is refused by your card issuer, or if you fail to pay us in accordance with the payment plan, we will contact you to ask for an alternative method of payment.
          </p>
          <p>
            If you requested a refund, an administration fee of 10 percent of the total amount is applicable.
          </p>
          <p>
            Administration fees not applicable for refund requests made within 24 hours after receiving a clear payment.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Withdrawal and Cancellation</h2>
          <p>
            You can withdraw the Order by telling us before the Contract is made, if you simply wish to change your mind and without giving us a reason, and without incurring any liability.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Right to Cancel</h3>
          <p>
            Subject as stated in these Terms and Conditions, you can cancel this contract within 14 days after receiving a clear payment.
          </p>
          <p>
            In a contract for the supply of services only (without goods), the cancellation period will expire 14 days from the day the Contract was entered into. However, you cannot change your mind (even if the cancellation period is still running) and we have already delivered the service.
          </p>
          <p>
            You cannot cancel the order (even if the cancellation period is still running) if the order was for digital content and we have sent you the digital content or the necessary log-in details.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery</h2>
          <p>
            We will deliver the Services, including any Goods, to the Delivery Location by the time or within the agreed period or, failing any agreement:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>In the case of Services, within a reasonable time; and</li>
            <li>In the case of Goods, without undue delay and, in any event, not more than 30 days after the day on which the Contract is entered into.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Conformity</h2>
          <p>We have a legal duty to supply the Services and Goods in conformity with the Contract.</p>
          <p>Upon delivery, the Goods will:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Be of satisfactory quality;</li>
            <li>Be reasonably fit for any particular purpose for which you buy the Goods;</li>
            <li>Conform to their description.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Personal Information</h2>
          <p>
            We retain and use all information strictly under the Privacy Policy.
          </p>
          <p>
            We may contact you by using e-mail or other electronic communication methods and by pre-paid post and you expressly agree to this.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Privacy</h2>
          <p>
            Your privacy is critical to us. We respect your privacy and comply with the General Data Protection Regulation with regard to your personal information.
          </p>
          <p>
            All events, online or offline, are recorded and the recorded materials may be used for marketing and promotions. For all online events, if you have turned on your camera, it will be considered as your permission to use the footage with your image on.
          </p>
          <p>
            For any enquiries or feedback regarding data privacy, you can email:{" "}
            <a href="mailto:team@iamverse.com" className="text-primary hover:underline">team@iamverse.com</a>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Excluding Liability</h2>
          <p>
            The Supplier does not exclude liability for: (i) any fraudulent act or omission; or (ii) death or personal injury caused by negligence or breach of the Supplier's other legal obligations. Subject to this, we are not liable for (i) loss which was not reasonably foreseeable to both parties at the time when the Contract was made, or (ii) loss (eg loss of profit) to your business, trade, craft or profession which would not be suffered by a Consumer.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law, Jurisdiction and Complaints</h2>
          <p>
            The Terms and Conditions (including any non-contractual matters) is governed by the law of United Arab Emirates.
          </p>
          <p>
            Disputes can be submitted to the jurisdiction of the courts of United Arab Emirates.
          </p>
          <p>
            We try to avoid any dispute, so we deal with complaints as follows: If a dispute occurs customers should contact us to find a solution. We will aim to respond with an appropriate solution within 5 days.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
