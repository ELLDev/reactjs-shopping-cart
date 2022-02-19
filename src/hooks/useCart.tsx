import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
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
      });
    }
    console.log(cart);
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    // localStorage.setItem('@RocketShoes:cart', JSON.stringify([]));
    // try {
    //   // TODO
    // } catch {
    //   // TODO
    // }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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
