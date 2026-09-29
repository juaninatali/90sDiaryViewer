import Head from "next/head";
import { Layout } from "@/components/Layout";

const contactEmail = process.env.NEXT_PUBLIC_ARCHIVE_CONTACT_EMAIL?.trim();

export default function AboutPage() {
  return (
    <Layout>
      <Head>
        <title>About | 90s Diary Archive</title>
        <meta
          name="description"
          content="About the 90s Diary Archive, its historical purpose, third-party rights information, privacy information and rights-holder contact process."
        />
      </Head>
      <article className="mx-auto max-w-3xl space-y-8 pb-12">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold">About the archive</h1>
          <p className="text-sm text-muted-foreground">
            This About and rights information is a work in progress and will be
            reviewed before the archive&apos;s public launch.
          </p>
          <p>
            The 90s Diary Archive is an independent personal archival project
            preserving and presenting diaries and associated cultural material
            relating to the Buenos Aires underground and electronic music scene
            of the 1990s.
          </p>
          <p>
            Handwritten diary pages, event flyers, tickets, photographs and other
            ephemera and historical printed material are presented primarily for
            historical, documentary and cultural purposes. This is an ongoing
            digitisation project; additional material and contextual information
            may be added over time.
          </p>
        </header>

        {/* Review this provisional rights/privacy wording after the planned copyright/trademark audit and before definitive public launch. */}
        <section aria-labelledby="third-party-rights" className="space-y-4">
          <h2 id="third-party-rights" className="text-2xl font-semibold">
            Historical material and third-party rights
          </h2>
          <p>
            Historical material reproduced in the archive may contain third-party
            artwork, photographs, graphic design, trademarks and logos,
            event/promoter branding, sponsor branding and other copyrighted material.
            Trademarks, logos and other third-party material remain associated
            with their respective rights holders where applicable.
          </p>
          <p>
            Their appearance within scanned historical artefacts is intended to
            reproduce and document the original material. It should not be
            interpreted as current sponsorship, affiliation or endorsement of
            the 90s Diary Archive.
          </p>
          <p>
            A full copyright and trademark audit has not yet been completed.
            This notice is provisional while the archive undergoes a more
            detailed review.
          </p>
        </section>

        <section aria-labelledby="rights-holder-requests" className="space-y-4">
          <h2 id="rights-holder-requests" className="text-2xl font-semibold">
            Rights holders / takedown requests
          </h2>
          <p>
            If you believe material displayed in the archive infringes rights
            you hold, or you are its creator or rights holder and have concerns
            about its inclusion, please contact the archive.
          </p>
          <p>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="break-words underline underline-offset-4 hover:text-foreground">
                Contact the archive: {contactEmail}
              </a>
            ) : (
              "Rights-holder contact details will be published here before the archive's public launch."
            )}
          </p>
          <p>Please provide enough information to identify:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>The material concerned.</li>
            <li>Where it appears in the archive, ideally with a page link.</li>
            <li>Your relationship to the material or right being asserted.</li>
            <li>The nature of your concern.</li>
            <li>Your preferred contact details for a response.</li>
          </ul>
          <p>
            Requests will be reviewed. Material may be temporarily restricted or
            removed while a legitimate rights concern is investigated.
          </p>
        </section>

        <section aria-labelledby="privacy" className="space-y-4">
          <h2 id="privacy" className="text-2xl font-semibold">Privacy</h2>
          <p>
            This is provisional privacy information describing the current
            application. It will be reviewed before public launch, including
            the hosting setup and any changes to site functionality.
          </p>
          <p>
            The current application has no user registration or account system,
            comments or contact forms, and includes no analytics or advertising
            scripts. Search terms and filters are sent to the archive&apos;s own
            server to retrieve results. The application stores your theme
            preference in your browser&apos;s localStorage.
          </p>
          <p>
            Opening the Map page loads Google Maps when it is configured. Your
            browser connects directly to Google to display the map and to look
            up archive venue addresses. These requests share connection
            information, such as your IP address, with Google. The map uses
            archive addresses; it does not request your device&apos;s location.
          </p>
          <p>
            Venue addresses and their coordinates are cached in your browser&apos;s
            localStorage to reduce repeated lookups. Cached results are reused
            for up to 29 days. Expired records are cleaned up when the map runs;
            they may remain in browser storage while the site is closed.
            You can remove this cache and the saved theme preference by clearing
            this site&apos;s browser data.
          </p>
          <p>
            Google&apos;s handling of information through its services is governed
            by its own privacy policies. The archive&apos;s application does not
            itself set cookies; this is not a statement about cookies or storage
            used by third-party services. Contact by email, when available,
            uses your email application and shares the details you choose to
            send with the archive.
          </p>
        </section>
      </article>
    </Layout>
  );
}
