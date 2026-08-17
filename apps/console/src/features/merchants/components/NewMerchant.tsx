export const NewAdminUser = () => {
  return (
    <section>
      <form>
        <div className="space-y-5">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium leading-6"
            >
              First Name
            </label>
            <div className="mt-2 relative rounded-md">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="firstName"
                placeholder="Enter first name"
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium leading-6"
            >
              Last Name
            </label>
            <div className="mt-2 relative rounded-md">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="lastName"
                placeholder="Enter last name"
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium leading-6"
            >
              Phone Number
            </label>
            <div className="mt-2 relative rounded-md">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="phone"
                placeholder="Enter phone number"
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6"
            >
              Email Address
            </label>
            <div className="mt-2 relative rounded-md">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email address"
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium leading-6"
            >
              Role
            </label>
            <div className="mt-2 relative rounded-md">
              <select
                id="role"
                name="role"
                defaultValue="Admin"
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 ring-1 ring-gray-300 hover:ring-gray-400 placeholder:text-gray-300 focus:ring-1 focus:ring-gray-300 text-sm leading-6"
              >
                <option>Admin</option>
                <option>Customer Support</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button
            type="submit"
            className="flex justify-center rounded-md gradient-bg min-w-[14rem] py-[0.56rem] px-3 sm:px-6 gap-x-2 text-sm font-medium text-white shadow-xs"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  );
};
