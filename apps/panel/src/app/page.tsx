import { HomeScreenButtons } from "#/components/home/home-screen-buttons";
import { HydrateClient } from "#/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Serial<span className="text-[hsl(280,100%,70%)]">SMS</span>
          </h1>
          <div className="flex flex-col gap-2 text-center text-lg">
            <p>
              <span className="font-bold">SerialSMS</span> is an app built for
              handling SMS messages using your Huawei E173 (or other compatible
              models) modem.
            </p>
            <p>
              It provides a web interface for sending and receiving SMS messages
              and a feature-rich API for developers.
            </p>
            <p>
              The app is built with <span className="font-bold">Next.js</span>,{" "}
              <span className="font-bold">Serialport</span>,{" "}
              <span className="font-bold">PostgreSQL</span>, and{" "}
              <span className="font-bold">IORedis</span> in a Pub/Sub
              configuration to link the rest to eachother.
            </p>
          </div>
          <HomeScreenButtons />
        </div>
      </main>
    </HydrateClient>
  );
}
