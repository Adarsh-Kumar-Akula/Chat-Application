import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="font-bold">Chat App</h1>
      <div className="space-x-4">
        <Link to="/">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/add-friend">Add Friend</Link>
        <Link to="/chat">Chat</Link>
      </div>
    </nav>
  );
};

export default Navbar;
