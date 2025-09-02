import InputForm from "../components/InputForm";

const Home = () => (
  <div className="flex-grow flex flex-col items-center justify-center p-4">
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Hello, Creator!
        </span>
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        How can I help you today?
      </p>
    </div>
    <InputForm />
  </div>
);

export default Home;
