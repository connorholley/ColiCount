-- Create the Users table first, since Plates references it
CREATE TABLE Coliform.Users (
    uID INT AUTO_INCREMENT PRIMARY KEY,       
    user_name VARCHAR(10) UNIQUE NOT NULL,
    pass VARCHAR(10) NOT NULL                 
);

-- Create the Plates table
CREATE TABLE Coliform.Plates (
    pID INT AUTO_INCREMENT PRIMARY KEY,  
    uID INT,                             
    sci_name VARCHAR(255) NOT NULL,           
    temp DECIMAL(5, 2),                      
    press DECIMAL(5, 2),                     
    duration INT,                             
    plate_type ENUM('blood', 'chocolate', 'thayer-martin') NOT NULL,  
    count INT,                               
    created_at DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (uID) REFERENCES Coliform.Users(uID) ON DELETE CASCADE 
);
