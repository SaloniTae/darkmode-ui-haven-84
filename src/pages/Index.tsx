
import { MainLayout } from "@/components/layout/MainLayout";
import { DataCard } from "@/components/ui/DataCard";
import { Database, FileJson, FileText, FolderOpen, Server, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Data Collections",
    description: "Visualize and manage your Firebase collections with ease.",
    icon: <FolderOpen className="h-6 w-6" />,
    path: "/database"
  },
  {
    title: "Schema Viewer",
    description: "Understand your data structure in a visual format.",
    icon: <FileJson className="h-6 w-6" />,
    path: "/database"
  },
  {
    title: "Realtime Sync",
    description: "Changes instantly reflect in your dashboard.",
    icon: <Server className="h-6 w-6" />,
    path: "/database"
  },
  {
    title: "Authentication",
    description: "Manage user authentication and permissions.",
    icon: <ShieldCheck className="h-6 w-6" />,
    path: "/database"
  }
];

const Index = () => {
  return (
    <MainLayout>
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-slide-in">
          <div className="inline-block p-2 px-3 bg-primary/10 rounded-full mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              <span>Firebase Database Explorer</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
            Beautiful Firebase UI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore and manage your Firebase database with an elegant, intuitive interface 
            designed for the best user experience.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link to="/database">
                Explore Database
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Link to={feature.path} key={index} className="block">
              <DataCard
                title={feature.title}
                cardClassName="h-full"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-primary/10">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </DataCard>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
