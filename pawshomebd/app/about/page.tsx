import MyHeader from "@/components/header";
import MyNavigation from "@/components/navigation";

export default function AboutUs() {
  return (
    <>
      <MyHeader name="About" message="Learn more about us" />
      <MyNavigation />
      <h1>About Us</h1>
      <p>This is the about page of our application.</p>
    </>
  );
}