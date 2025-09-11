const CommunityModalLayout = ({ children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
);

export default CommunityModalLayout;
