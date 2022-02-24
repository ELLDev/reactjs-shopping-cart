import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { convertToObject } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [canAddToCart, setCanAddToCart] = useState(true);
  const [productAmountInStock, setProductAmountInStock] = useState(0);
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    let cartCopy = cart;
    const productIndex = cartCopy.findIndex(product => product.id === productId);

    if (cartCopy[productIndex]) {
      cartCopy[productIndex].amount += 1;
      setCart(cartCopy);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } else {
      // api.get(`stock/${productId}`).then(response => setProductAmount(response.data.amount));
      api.get<Product>(`products/${productId}`).then((response) => {
        const newProduct = {
          id: productId,
          title: response.data.title,
          price: response.data.price,
          image: response.data.image,
          amount: 1,
        }
        cartCopy.push(newProduct);
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      });
    }
    // try {
    //   // TODO
    // } catch {
    //   // TODO
    // }
  };

  const removeProduct = (productId: number) => {
    let cartCopy = cart;
    setCart(cartCopy.filter(product => product.id !== productId));
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    // try {
    //   // TODO
    // } catch {
    //   // TODO
    // }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      let cartCopy = cart;
      const productIndex = cartCopy.findIndex(product => product.id === productId);
      setCanAddToCart(true);

      // console.log(canAddToCart,'before api');
      api.get(`stock/${productId}`).then(response => setProductAmountInStock(response.data.amount));

      // api.get(`stock/${productId}`).then(response => {
      //   if (cartCopy[productIndex].amount + amount > response.data.amount) {
      //     // console.log("nai");          
      //     setCanAddToCart(false);
      //     console.log(canAddToCart,'in api');
      //   }
      // });
      // console.log(canAddToCart,'outside api');
      if (cartCopy[productIndex].amount + amount > productAmountInStock) {
        cartCopy[productIndex].amount += amount;
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      } else {
        // console.log(amount);
        // console.log(cartCopy[productIndex].amount + amount);
        throw Error;
      }
    } catch {
      setCanAddToCart(true);
      toast.error('Quantidade solicitada fora de estoque');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
