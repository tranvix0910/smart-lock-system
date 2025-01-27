import useUserAttributes from "../hooks/useUserAttributes";

const formatKey = (key) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Profile = () => {

    const userAttributes = useUserAttributes();

    console.log(userAttributes);
    if (!userAttributes) {
      return <div className="text-center mt-10">Loading user attributes...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-10">
          <h1 className="text-2xl text-neutral-700 font-medium mb-4 text-center">User Information</h1>
          <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
            <tbody>
              {Object.entries(userAttributes).map(([key, value], index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-3 text-gray-700">{formatKey(key)}</td>
                  <td className="px-6 py-3 text-gray-700">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    )
}

export default Profile