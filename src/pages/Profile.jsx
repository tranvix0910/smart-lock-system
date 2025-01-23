const Profile = () => {

    const userAttributes = [
        { name: "Name", value: "Vi Tran" },
        { name: "Birthdate", value: "09/10/2004" },
        { name: "Gender", value: "Male" },
        { name: "Email", value: "vitran6366@gmail.com" },
        { name: "Email Student", value: "n22dcci044@student.ptithcm.edu.vn" },
        { name: "Address", value: "311 Hoang Huu Nam, Tan Phu, Quan 9" },
        { name: "Locale", value: "Dong Thap" },
        { name: "Phone Number", value: "+84969694901" },
        { name: "User ID (Sub)", value: "798a85ac-a061-709b-df31-4547b836aab3" },
    ];

    return (
        <div className="max-w-4xl mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-4 text-center">User Information</h1>
          <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Attribute Name</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {userAttributes.map((attr, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-3 text-gray-700">{attr.name}</td>
                  <td className="px-6 py-3 text-gray-700">{attr.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    )
}

export default Profile