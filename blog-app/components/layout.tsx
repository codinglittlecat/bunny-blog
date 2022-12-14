import React, { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import Router from "next/router";
import { ReactNode } from "react";

const navigation = [{ name: "Blog", href: "/blog", current: true }];
const userNavigation = [{ name: "Sign out", href: "/sign-in" }];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export type profileInput = {
  id?: number;
  name?: string;
  email?: string;
  updateProfile?: () => {};
};

export const ProfileContext = React.createContext<profileInput>({});

const GET_PROFILE = gql`
  mutation Profile($token: String!) {
    profile(data: { token: $token }) {
      id
      name
      email
    }
  }
`;

let token = null;

type typeProps = {
  children: ReactNode;
};

export default function Layout({ children }: typeProps) {
  const [profile] = useMutation(GET_PROFILE);
  const [me, setMe] = useState<profileInput>({});

  const updateProfile: any = () => {
    token = window.localStorage.getItem("blog-token");

    token
      ? profile({
          variables: { token: token },
        }).then(({ data }) => {
          let { profile } = data;

          if (!profile.id) {
            setMe({});
            window.localStorage.setItem("blog-token", "");
          } else {
            setMe(profile);
          }
        })
      : setMe({});
  };

  useEffect(() => {
    updateProfile();
  }, []);

  const handleLogout = () => {
    setMe({});
    window.localStorage.setItem("blog-token", "");
    Router.push("/sign-in");
  };

  return (
    <ProfileContext.Provider
      value={{
        id: me?.id,
        name: me?.name,
        email: me?.email,
        updateProfile: updateProfile,
      }}
    >
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <span
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                {me.id ? (
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="ml-3 relative">
                        <div>
                          <Menu.Button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                              {me.name}
                            </span>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <div
                                    onClick={handleLogout}
                                    className="cursor-pointer"
                                  >
                                    <span
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                                      )}
                                    >
                                      {item.name}
                                    </span>
                                  </div>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                ) : (
                  <div className="ml-auto">
                    <Link href="/sign-in">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                        Sign in
                      </span>
                    </Link>
                    <Link href="/sign-up">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                        Sign up
                      </span>
                    </Link>
                  </div>
                )}
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block px-3 py-2 rounded-md text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              {me && (
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {me.name}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {me.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main>{children}</main>
    </ProfileContext.Provider>
  );
}
