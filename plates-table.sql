CREATE TABLE Coliform.Plates (
    pID INT AUTO_INCREMENT PRIMARY KEY,       
    eId INT,
    sci_name VARCHAR(255) NOT NULL,           -- Genus and species of the organism
    temp DECIMAL(5, 2),            -- Temperature in Celsius (with decimals if needed)
    press DECIMAL(5, 2),               -- Pressure in KPa (with decimals if needed)
    duration INT,                               -- Incubation duration in days
    plate_type ENUM('blood', 'chocolate', 'thayer-martin') NOT NULL,  -- Agar type options
    count INT,                              -- Coliform count (number of coliforms observed)
    created_at DATE DEFAULT CURRENT_DATE
);

