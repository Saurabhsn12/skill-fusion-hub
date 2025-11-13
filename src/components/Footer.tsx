const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Skill Fusion
            </h3>
            <p className="text-sm text-muted-foreground">
              A Major Project for University Internal Evaluation
            </p>
          </div>
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Developed and Designed by the Skill Fusion Team
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Idea & Lead Developer:</span> Saurabh Nehra
              </div>
              <div>
                <span className="font-medium text-foreground">UI/UX Designer:</span> Rahul Sharma
              </div>
              <div>
                <span className="font-medium text-foreground">Backend Programmer:</span> Amish Kanyal
              </div>
              <div>
                <span className="font-medium text-foreground">Frontend Developer:</span> Kartik Sharma
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              © 2025 Skill Fusion. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
