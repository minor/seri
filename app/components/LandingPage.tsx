"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface LandingPageProps {
  isSignedIn: boolean;
}

export default function LandingPage({ isSignedIn }: LandingPageProps) {
  return (
    <div>
      <div className="bg-background min-h-screen">
        <header className="border-b border-gray-200/50">
          <div className="container mx-auto px-4">
            <nav className="flex h-16 items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold"
              >
                <div
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300/85 to-gray-100/95"
                  aria-label="Seri logo"
                />
                Seri
              </Link>
              <button className="md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-menu"
                >
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              </button>
              <div className="hidden items-center space-x-4 md:flex">
                <ThemeToggle />
                {!isSignedIn ? (
                  <SignInButton mode="modal">
                    <button className="focus-visible:ring-ring hover:cursor-pointer hover:-translate-y-0.5 duration-200 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium shadow transition-all focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
                      Sign In
                    </button>
                  </SignInButton>
                ) : (
                  <UserButton afterSignOutUrl="/" />
                )}
              </div>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-card-foreground bg-background mb-8 rounded-xl border border-b border-neutral-200 shadow-none">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 flex h-full w-full items-center justify-center [mask-repeat:no-repeat] [mask-size:40px]">
                  <svg
                    className="pointer-events-none absolute z-0 h-full w-full"
                    width="100%"
                    height="100%"
                    viewBox="0 0 696 316"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715M-233 -357C-233 -357 -165 48 299 175C763 302 831 707 831 707M-226 -365C-226 -365 -158 40 306 167C770 294 838 699 838 699M-219 -373C-219 -373 -151 32 313 159C777 286 845 691 845 691M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683M-205 -389C-205 -389 -137 16 327 143C791 270 859 675 859 675M-198 -397C-198 -397 -130 8 334 135C798 262 866 667 866 667M-191 -405C-191 -405 -123 0 341 127C805 254 873 659 873 659M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651M-177 -421C-177 -421 -109 -16 355 111C819 238 887 643 887 643M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635M-163 -437C-163 -437 -95 -32 369 95C833 222 901 627 901 627M-156 -445C-156 -445 -88 -40 376 87C840 214 908 619 908 619M-149 -453C-149 -453 -81 -48 383 79C847 206 915 611 915 611M-142 -461C-142 -461 -74 -56 390 71C854 198 922 603 922 603M-135 -469C-135 -469 -67 -64 397 63C861 190 929 595 929 595M-128 -477C-128 -477 -60 -72 404 55C868 182 936 587 936 587M-121 -485C-121 -485 -53 -80 411 47C875 174 943 579 943 579M-114 -493C-114 -493 -46 -88 418 39C882 166 950 571 950 571M-107 -501C-107 -501 -39 -96 425 31C889 158 957 563 957 563M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555M-93 -517C-93 -517 -25 -112 439 15C903 142 971 547 971 547M-86 -525C-86 -525 -18 -120 446 7C910 134 978 539 978 539M-79 -533C-79 -533 -11 -128 453 -1C917 126 985 531 985 531M-72 -541C-72 -541 -4 -136 460 -9C924 118 992 523 992 523M-65 -549C-65 -549 3 -144 467 -17C931 110 999 515 999 515M-58 -557C-58 -557 10 -152 474 -25C938 102 1006 507 1006 507M-51 -565C-51 -565 17 -160 481 -33C945 94 1013 499 1013 499M-44 -573C-44 -573 24 -168 488 -41C952 86 1020 491 1020 491M-37 -581C-37 -581 31 -176 495 -49C959 78 1027 483 1027 483M-30 -589C-30 -589 38 -184 502 -57C966 70 1034 475 1034 475M-23 -597C-23 -597 45 -192 509 -65C973 62 1041 467 1041 467M-16 -605C-16 -605 52 -200 516 -73C980 54 1048 459 1048 459M-9 -613C-9 -613 59 -208 523 -81C987 46 1055 451 1055 451M-2 -621C-2 -621 66 -216 530 -89C994 38 1062 443 1062 443M5 -629C5 -629 73 -224 537 -97C1001 30 1069 435 1069 435M12 -637C12 -637 80 -232 544 -105C1008 22 1076 427 1076 427M19 -645C19 -645 87 -240 551 -113C1015 14 1083 419 1083 419"
                      stroke="url(#paint0_radial_242_278)"
                      strokeOpacity="0.15"
                      strokeWidth="0.5"
                    ></path>
                    <defs>
                      <radialGradient
                        id="paint0_radial_242_278"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
                      >
                        <stop
                          offset="0.0666667"
                          stopColor="var(--neutral-300)"
                        ></stop>
                        <stop
                          offset="0.243243"
                          stopColor="var(--neutral-300)"
                        ></stop>
                        <stop
                          offset="0.43594"
                          stopColor="white"
                          stopOpacity="0"
                        ></stop>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center space-y-6 p-6 py-16 text-center">
                <div className="max-w-[800px] text-5xl font-bold tracking-tighter sm:text-6xl">
                  Your Personal Assistant for{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Getting Things Done.
                  </span>
                </div>
                <div className="text-muted-foreground max-w-[500px] text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Stay organized and productive with Seri, your AI-powered
                  assistant that helps you manage tasks, schedule meetings, and
                  streamline your workflow. Works with Google Calendar.
                </div>
                <div className="flex gap-4">
                  {!isSignedIn ? (
                    <SignUpButton mode="modal">
                      <button className="focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:size-4 hover:cursor-pointer &_svg]:shrink-0 border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-8 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
                        Get Started for Free
                      </button>
                    </SignUpButton>
                  ) : (
                    <button className="focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:size-4 hover:cursor-pointer [&_svg]:shrink-0 border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-8 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
                      Launch App
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div id="bento-section" className="pt-4">
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:auto-rows-[20rem] md:grid-cols-3">
              <div className="group/bento shadow-input [&>p:text-lg] row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:shadow-xl md:col-span-1">
                <div className="dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex h-full min-h-[6rem] w-full flex-1 flex-col items-center justify-center space-y-2">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-purple-500/10 animate-pulse flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500/40"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="transition duration-200 group-hover/bento:translate-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-neutral-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <div className="mb-2 mt-2 font-sans font-bold text-neutral-600">
                    Natural Language Processing
                  </div>
                  <div className="font-sans text-xs font-normal text-neutral-600">
                    <span className="text-sm">
                      Just type or speak your tasks, and Seri will handle the
                      rest—and it learns from your past interactions.
                    </span>
                  </div>
                </div>
              </div>
              <div className="group/bento shadow-input [&>p:text-lg] row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:shadow-xl md:col-span-1">
                <div className="dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2">
                  <div className="flex flex-col space-y-3 p-4">
                    <div className="h-8 w-[70%] rounded-md bg-neutral-100 animate-none">
                      <p className="text-sm text-left text-nowrap p-1.5 px-2 z-1 animate-none">
                        meeting tmw @ 2pm?
                      </p>
                    </div>
                    <div className="h-8 w-[56.5%] rounded-md bg-neutral-100 animate-none">
                      <p className="text-sm text-left text-[#D298FF] text-nowrap p-1.5 px-2 z-1 animate-none">
                        {">"} forward to Seri
                      </p>
                    </div>
                    <div className="h-16 w-full rounded-md bg-neutral-100 animate-none">
                      <p className="text-sm text-left text-nowrap p-2.75 px-2 z-1 animate-none">
                        taken care of — added to your
                        <br />
                        calendar from 2-2:30pm tmw.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="transition duration-200 group-hover/bento:translate-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-neutral-500"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <div className="mb-2 mt-2 font-sans font-bold text-neutral-600">
                    Your Own Email Assistant
                  </div>
                  <div className="font-sans text-xs font-normal text-neutral-600">
                    <span className="text-sm">
                      Automatically organize your tasks, meetings, and workflow
                      with just a quick forwarding of the email.
                    </span>
                  </div>
                </div>
              </div>
              <div className="group/bento shadow-input [&>p:text-lg] row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:shadow-xl md:col-span-1">
                <div className="dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2 rounded-lg">
                  <div className="h-full w-full rounded-lg bg-neutral-900 p-4 font-mono text-sm text-neutral-200">
                    <div className="text-neutral-300">Mon</div>
                    <div className="pl-4 text-purple-400">
                      {"9:00 Team Sync"}
                      <br />
                      {"11:00 Client Call"}
                      <br />
                      {"2:00 Planning"}
                    </div>
                  </div>
                </div>
                <div className="transition duration-200 group-hover/bento:translate-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-neutral-500"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div className="mb-2 mt-2 font-sans font-bold text-neutral-600">
                    Calendar Intelligence
                  </div>
                  <div className="font-sans text-xs font-normal text-neutral-600">
                    <span className="text-sm">
                      Smart scheduling that understands your preferences,
                      manages conflicts, and finds the perfect time slots for
                      your meetings.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="bg-card text-card-foreground mx-auto mt-12 max-w-4xl rounded-xl border shadow">
            <div className="flex flex-col items-center justify-center p-6 py-8">
              <h3 className="mb-8 text-center text-2xl font-bold">
                What our users say:
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div
                    className="testimonial-embed"
                    style={{
                      margin: "0",
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <blockquote
                      className="font-[575] text-xl font-serif"
                      style={{
                        margin: "0",
                        padding: "0",
                        borderLeft: "4px solid #e5e7eb",
                        paddingLeft: "16px",
                      }}
                    >
                      "Seri has completely transformed how I manage my daily
                      tasks and schedule. The AI-powered assistance is like
                      having a personal productivity expert by my side at all
                      times."
                    </blockquote>
                    <p className="text-lg font-normal text-right mt-2">
                      — Alex Chen (Software Engineer)
                    </p>
                  </div>
                  <div
                    className="testimonial-embed"
                    style={{
                      margin: "0",
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <blockquote
                      className="font-[575] text-xl font-serif"
                      style={{
                        margin: "0",
                        padding: "0",
                        borderLeft: "4px solid #e5e7eb",
                        paddingLeft: "16px",
                      }}
                    >
                      "The smart organization features in Seri have helped me
                      stay on top of my work like never before. It's intuitive,
                      powerful, and actually makes getting things done
                      enjoyable."
                    </blockquote>
                    <p className="text-lg font-normal text-right mt-2">
                      — Sarah Johnson (Product Manager)
                    </p>
                  </div>
                </div>
              </h3>
            </div>
          </div> */}
        </main>
      </div>
      <footer className="bg-card">
        <div className="bg-card text-card-foreground rounded-none border border-none shadow-none">
          <div className="p-8">
            <div className="mx-auto w-full max-w-screen-2xl">
              <div className="mt-12 border-t border-gray-200 pt-8">
                <p className="text-muted-foreground hover:cursor-default text-center text-sm">
                  hacked together with{" "}
                  <span className="hover:text-red-500">
                    ♡ by{" "}
                    <a
                      href="https://saurish.com"
                      className="underline hover:text-black/70"
                    >
                      saurish
                    </a>{" "}
                  </span>
                  | 2025 © seri
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
