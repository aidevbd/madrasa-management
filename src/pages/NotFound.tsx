const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">পৃষ্ঠাটি পাওয়া যায়নি</p>
        <a href="/" className="text-primary underline hover:text-primary/80">
          হোমে ফিরে যান
        </a>
      </div>
    </div>
  );
};

export default NotFound;
