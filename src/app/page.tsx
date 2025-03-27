import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      <div
        className="absolute inset-0 bg-no-repeat bg-center pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: "url(/TreeOfLife.svg)",
          backgroundSize: "contain",
        }}
      ></div>

      <header className="p-6 border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">Tree of Life</h1>
          <p className="text-muted-foreground mt-2">
            Interactive Kabbalistic Visualization
          </p>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-primary">
              Explore the <span className="text-accent">Kabbalistic</span> Tree
              of Life
            </h2>
            <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
              The Tree of Life is a sacred diagram used in the Kabbalah, a
              mystical tradition that originated in Judaism. It maps the path to
              spiritual enlightenment through ten spheres (Sephiroth) connected
              by 22 paths, representing the journey of divine consciousness and
              the human soul.
            </p>
            <div className="mt-8">
              <Link href="/kabbalah">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
                  Explore the 3D Visualization
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-primary">10 Sephiroth</CardTitle>
                  <CardDescription>Divine Emanations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    The ten spheres represent different divine attributes and
                    stages of creation, from Keter (Crown) to Malkuth (Kingdom).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-secondary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-secondary">22 Paths</CardTitle>
                  <CardDescription>Sacred Connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    The 22 paths correspond to the Hebrew alphabet and connect
                    the Sephiroth, representing states of consciousness.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-accent">Three Pillars</CardTitle>
                  <CardDescription>Cosmic Balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    The left pillar (Severity), the right pillar (Mercy), and
                    the middle pillar (Equilibrium) represent cosmic forces in
                    balance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">
                    Four Worlds
                  </CardTitle>
                  <CardDescription>Layers of Reality</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    Atziluth (Emanation), Briah (Creation), Yetzirah
                    (Formation), and Assiah (Action) represent different
                    spiritual realms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-border bg-card/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            An interactive exploration of the Kabbalistic Tree of Life. Learn
            more about the mystical journey through the ten Sephiroth.
          </p>
        </div>
      </footer>
    </div>
  );
}
