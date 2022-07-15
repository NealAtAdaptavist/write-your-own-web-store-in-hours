import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const BuyNowButton = async () => {
  const { isLoading, isAuthenticated, loginWithPopup, getAccessTokenSilently} = useAuth0();

  const buy = () => {};

  if (isLoading) return <></>;

  if (isAuthenticated) {
    const access_token = await getAccessTokenSilently();
    console.log(access_token)
    return <button onClick={buy}>Buy Now</button>;
  }
  
  return <button onClick={loginWithPopup}>Log In To Purchase</button>;
};

const Home = () => {
  // const [products, setProducts] = useState();

  // useEffect(() => {
  //   fetch("/.netlify/functions/products")
  //     .then((res) => res.json())
  //     .then((json) => {
  //       setProducts(json);
  //     });
  // }, [setProducts]);

  return (
    <>
      <h1>Home</h1>
      <p>Welcome to my web store!</p>
      <div className="products">
      <BuyNowButton  />
      </div>
    </>
  );
};

export default Home;
