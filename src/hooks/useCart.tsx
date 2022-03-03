import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
    try {
      let cartCopy = [...cart];
      const cartProductIndex = cartCopy.findIndex(product => product.id === productId);
      const product = await api.get(`products/${productId}`);

      if (cartCopy[cartProductIndex]) {
        const stock = await api.get(`stock/${productId}`);

        if (cartCopy[cartProductIndex].amount < stock.data.amount) {
          cartCopy[cartProductIndex].amount += 1;
          setCart(cartCopy);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
        } else {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
      } else {
        const newProduct = {
          id: product.data.id,
          title: product.data.title,
          price: product.data.price,
          image: product.data.image,
          amount: 1,
        }
        cartCopy.push(newProduct);
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let cartCopy = [...cart];      
      const productIndex = cartCopy.findIndex(product => product.id === productId);

      if (productIndex >= 0) {
        cartCopy = cartCopy.filter(product => product.id !== productId);
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
      } else {
        throw Error();
      }
    } catch {
        toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {     
      let cartCopy = [...cart];
      const stock = await api.get(`stock/${productId}`);
      const cartProductIndex = cartCopy.findIndex(product => product.id === productId);

      if (amount <= 0) {
        return;
      }

      if (amount <= stock.data.amount) {
        cartCopy[cartProductIndex].amount = amount; 
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
      } else {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
