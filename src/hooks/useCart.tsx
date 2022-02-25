import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
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
  const [productsInStock, setProductsInStock] = useState<Stock[]>([]);
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    api.get<Stock[]>(`stock`).then(response => setProductsInStock(response.data));
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
      const cartProductIndex = cartCopy.findIndex(product => product.id === productId);
      const stockProductIndex = productsInStock.findIndex(product => product.id === productId);
          
      if (cartCopy[cartProductIndex].amount + amount <= productsInStock[stockProductIndex].amount) {
        cartCopy[cartProductIndex].amount += amount;
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      } else {
        throw Error;
      }
    } catch {
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
