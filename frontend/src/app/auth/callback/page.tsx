import { CgSpinner } from "react-icons/cg";
import { HiCheckCircle } from "react-icons/hi";

export default function LoggingInWait() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <HiCheckCircle className="w-16 h-16 text-green-500 mb-1" />{" "}
      <p>Success!</p>
      <h2 className="text-2xl font-semibold m-2">You are being logged in...</h2>
      <p className="text-gray-600 flex items-center">
        <CgSpinner className="w-6 h-6 mr-2 animate-spin" />
        Redirecting to your previous location.
      </p>
    </div>
  );
}
