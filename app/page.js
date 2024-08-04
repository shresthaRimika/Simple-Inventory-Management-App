'use client'
import Image from "next/image"
import {useState ,useEffect} from "react"
import {firestore} from '@/firebase'
import {Box, Modal, Typography, Stack, TextField, Button } from "@mui/material"
import {collection, deleteDoc, doc, getDocs, query, getDoc, setDoc} from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchResults, setSearchResults] = useState([]);
  
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const removeItem = async(item) =>{
    const docRef = doc(collection(firestore,'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const{quantity} = docSnap.data()
      if(quantity === 1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {quantity: quantity-1})
      }
    }
    await updateInventory()
    await searchItem(item)
  }

  const addItem = async(item) =>{
    const docRef = doc(collection(firestore,'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const{quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity+1})
    }
    else{
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
    await searchItem(item)
  }

  const searchItem = () => {
    if (itemName.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = inventory.filter(({ name }) =>
      name.toLowerCase().includes(itemName.toLowerCase())
    );
    setSearchResults(results);
  };


  

  const resetSearch = () => {
    setItemName('');
    setSearchResults([]);
  };


  useEffect(() => {
    updateInventory()
  }, [])


  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    console.log('Search term:', searchTerm);
    // Add your search logic here
  };

  return (
    <Box 
      width="100vw"
      height= "100vh" 
      display= "flex"
      flexDirection= "column" 
      justifyContent= "center" 
      alignItems= "center" 
      gap={2}
    >
      <Modal open = {open} onClose = {handleClose}>
        <Box
          position= "absolute"
          top= "50%"
          left= "50%"
          // transform = "translate(-50%, -50%)"
          width={400}
          bgcolor="white"
          border= "2px sold #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection= "column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width = "100%" direction="row" spacing={2}>
            <TextField 
              variant= "outlined"
              fullWidth
              value = {itemName}
              onChange={(e)=>{
                setItemName(e.target.value)
              }}
            />

            <Button variant= "outlined" 
              onClick={()=>{
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      

      {/* startss here  */}

      <Box border="1px solid #333">
        <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" p={2}>
          <Button
              variant="contained"
              onClick={handleOpen}
              style={{ height: '40px', marginLeft: '10px' }} // Match the height of the TextField
              sx={{
                backgroundColor: '#004d40', // Dark teal color
                color: 'white',
                '&:hover': { backgroundColor: '#00332a' } // Slightly darker teal for hover effect
              }}
            >
              Add New Items
          </Button>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" p={2}>
          <TextField
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Search item"
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={searchItem}
            style={{ height: '40px', marginLeft: '10px' }} // Match the height of the TextField
          >
            Search
          </Button>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {(searchResults.length > 0 ? searchResults : inventory).map(({ name, quantity }) => (
            <Box 
            key={name} 
            width="100%"
            minheight= "150px"
            display= "flex" 
            alignItems= "center"
            justifyContent= "space-between"
            bgcolor="#f0f0f0"
            padding={5}
          >
            <Typography 
              variant="h3" 
              color="#333" 
              textAlign= "center"
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>

            <Typography 
              variant="h3" 
              color="#333" 
              textAlign= "center"
            >
              {quantity}
            </Typography>
            <Button variant="contained" 
              sx={{
                backgroundColor: '#4CAF50', // Green color for 'Add'
                color: 'white',
                '&:hover': { backgroundColor: '#388E3C' } // Darker green for hover
              }}
              onClick={() =>{
                addItem(name)
              }}
            >
              ADD
            </Button>
            <Stack direction="row" spacing={2}>
            <Button variant="contained" 
              sx={{
                backgroundColor: '#F44336', // Red color for 'Remove'
                color: 'white',
                '&:hover': { backgroundColor: '#C62828' } // Darker red for hover
              }}
              onClick={() =>{
                removeItem(name)
              }}
            >
              Remove
            </Button>
            
            </Stack>
          </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
