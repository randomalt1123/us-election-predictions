/**
 * Per-district (and Senate) race data for map tooltips.
 *
 * Default encoding — object keyed by id, value is a 2- or 3-tuple:
 *   [democraticCandidate, republicanCandidate]
 *   [democraticCandidate, republicanCandidate, warOverride]
 *
 * WAR comes from window.DISTRICT_WAR_BASE (database defaults) unless you set
 * an optional third slot / override `war:` for special cases (open seats with
 * two strong newcomers, scandals, etc.). That override fully replaces the base.
 *
 *   war = Wins Above Replacement in D−R points.
 *   Positive WAR helps Democrats; negative helps Republicans.
 *
 * Projected margin is computed (not stored):
 *   projected = 2024DistrictMargin
 *             + SWING_ELASTICITY × (genericBallotMargin − 2024NationalMargin)
 *             + war
 *
 * Forecast uses SWING_ELASTICITY = 0.85 (middle ground). Manual "Shift from 2024"
 * applies the full entered swing (elasticity = 1).
 * Generic ballot comes from POLL_AVERAGE.
 *
 * Example (use database WAR):
 *   DISTRICT_RACES["AZ-01"] = ["Amish Shah", "Jay Feely"];
 * Example (special-case override):
 *   DISTRICT_RACES["AZ-01"] = ["Amish Shah", "Jay Feely", 1.5];
 *
 * Nonstandard races (R vs R, D vs D, independent, etc.) go in
 * DISTRICT_RACE_OVERRIDES — omit `war` to use the database base.
 */

(function () {
  const PARTY_LABEL = {
    D: "D",
    R: "R",
    I: "I",
    G: "G",
    L: "L",
    O: "O",
  };

  /** @type {Record<string, [string|null, string|null, number?]>} */
  const DISTRICT_RACES = {
    "AL-01": ["Clyde Jones Jr.", "Jerry Carl"],
    "AL-02": ["Shomari Figures", "Rhett Marques"],
    "AL-03": ["Lee McInnis", "Mike Rogers"],
    "AL-04": ["Amanda Pusczek", "Robert Aderholt"],
    "AL-05": ["Andrew Sneed", "Dale Strong"],
    "AL-06": ["Maurice Mercer", "Gary Palmer"],
    "AL-07": ["Terri Sewell", "Ammie Akin"],
    "AR-01": ["Terri Green", "Rick Crawford"],
    "AR-02": ["Chris Jones", "French Hill"],
    "AR-03": ["Robb Ryerse", "Steve Womack"],
    "AR-04": ["James Russell", "Bruce Westerman"],
    "AZ-01": ["Amish Shah", "Jay Feely"],
    "AZ-02": ["Jonathan Nez", "Eli Crane"],
    "AZ-04": ["Greg Stanton", "Zudhi Jasser"],
    "AZ-05": ["Elizabeth Lee", "Mark Lamb"],
    "AZ-06": ["JoAnna Mendoza", "Juan Ciscomani"],
    "AZ-07": ["Adelita Grijalva", "Daniel Butierez"],
    "AZ-08": ["Bernadette Greene-Placentia", "Abraham Hamadeh"],
    "AZ-09": ["Dani Sterbinsky", "Paul Gosar"],
    "CA-01": ["Mike McGuire", "James Gallagher"],
    "CA-02": ["Jared Huffman", "Robin Littau"],
    "CA-03": ["Ami Bera", "Robb Tucker"],
    "CA-05": ["Michael Masuda", "Tom McClintock"],
    "CA-08": ["John Garamendi", "Rudy Recile"],
    "CA-09": ["Josh Harder", "John McBride"],
    "CA-10": ["Mark DeSaulnier", "Jeff Frese"],
    "CA-13": ["Adam Gray", "Kevin Lincoln"],
    "CA-15": ["Kevin Mullin", "Charles Hoelter"],
    "CA-16": ["Sam Liccardo", "Peter Soulé"],
    "CA-17": ["Ro Khanna", "Ritesh Tandon"],
    "CA-18": ["Zoe Lofgren", "Shane Lewis"],
    "CA-19": ["Jimmy Panetta", "Peter Coe Verbica"],
    "CA-20": ["Sandra Van Scotter", "Vince Fong"],
    "CA-21": ["Jim Costa", "Kyle Kirkland"],
    "CA-22": ["Randy Villegas", "David Valadao"],
    "CA-23": ["Tessa Lynn Hodge", "Jay Obernolte"],
    "CA-24": ["Salud Carbajal", "Bob Smith"],
    "CA-25": ["Raul Ruiz", "Joe Males"],
    "CA-26": ["Jacqui Irwin", "Sam Gallucci"],
    "CA-27": ["George Whitesides", "Jason Gibbs"],
    "CA-28": ["Judy Chu", "April Verlato"],
    "CA-30": ["Laura Friedman", "Scott Meyers"],
    "CA-31": ["Gil Cisneros", "Eric Ching"],
    "CA-32": ["Brad Sherman", "Larry Thompson"],
    "CA-33": ["Pete Aguilar", "Stephanie Vargas"],
    "CA-35": ["Norma Torres", "Mike Cargile"],
    "CA-36": ["Ted Lieu", "Houston Brignano"],
    "CA-38": ["Hilda Solis", "Pedro Casas"],
    "CA-39": ["Mark Takano", "Steve Manos"],
    "CA-41": ["Linda Sánchez", "Mitch Clemmons"],
    "CA-42": ["Robert Garcia", "Brian Burley"],
    "CA-43": ["Maxine Waters", "Christian Morales"],
    "CA-44": ["Nanette Barragán", "Genevieve Angel"],
    "CA-45": ["Derek Tran", "Chuong Vo"],
    "CA-46": ["Lou Correa", "David Pan"],
    "CA-47": ["Dave Min", "Jenny Le Roux"],
    "CA-48": ["Marni von Wilpert", "Jim Desmond"],
    "CA-49": ["Mike Levin", "Armen Kurdian"],
    "CA-50": ["Scott Peters", "Steve Cohen"],
    "CA-51": ["Sara Jacobs", "Ricardo Cabrera"],
    "CA-52": ["Juan Vargas", "Jeff Belle"],
    "CO-01": ["Melat Kiros", "Christy Peterson"],
    "CO-02": ["Joe Neguse", "Kelley Dennison"],
    "CO-03": ["Dwayne Romero", "Jeff Hurd"],
    "CO-04": ["Eileen Laubaucher", "Lauren Boebert"],
    "CO-05": ["Jessica Killin", "Jeff Crank"],
    "CO-06": ["Jason Crow", "Jason Clark"],
    "CO-07": ["Brittany Pettersen", "Tim Bennett"],
    "CO-08": ["Manny Rutinel", "Gabe Evans"],
    "CT-01": ["Luke Bronin", "Amy Chai"],
    "CT-02": ["Joe Courtney", "George Austin"],
    "CT-03": ["Rosa DeLauro", "Chris Lancia"],
    "CT-04": ["Jim Himes", "Michael Goldstein"],
    "CT-05": ["Jahana Hayes", "Chris Shea"],
    "DE-AL": ["Sarah McBride", "Joseph Arminio"],
    "FL-01": ["Gay Valimont", "Jimmy Patronis"],
    "FL-02": ["Amanda Green", "Austin Rogers"],
    "FL-03": ["Seth Harp", "Kat Cammack"],
    "FL-04": ["LaShonda Holloway", "Aaron Bean"],
    "FL-05": ["Rachel Grage", "John Rutherford"],
    "FL-06": ["Eric Yonce", "Randy Fine"],
    "FL-07": ["Bale Dalton", "Ryan Elijah"],
    "FL-08": ["Jennifer Jenkins", "Mike Haridopolos"],
    "FL-09": ["Darren Soto", "Dan Green"],
    "FL-11": ["James Pericola", "Joe Strada"],
    "FL-12": ["Kimberly Overman", "Gus Bilirakis"],
    "FL-13": ["Leela Gray", "Anna Paulina Luna"],
    "FL-14": ["Kathy Castor", "Mike Beltran"],
    "FL-15": ["Robert People", "Laurel Lee"],
    "FL-16": ["Kelly Kirschner", "Sydney Gruters"],
    "FL-17": ["Matthew Montavon", "Greg Steube"],
    "FL-18": ["Curtis Gibson", "Scott Franklin"],
    "FL-19": ["Victor Arias", "Jim Schwartzel"],
    "FL-20": ["Debbie Wasserman Schultz", "Brent Andersen"],
    "FL-21": ["James Martin", "Brian Mast"],
    "FL-22": ["Pia Dandiya", "Casey Askar"],
    "FL-23": ["Lois Frankel", "Deborah Adeimy"],
    "FL-24": ["Oliver Gilbert", "Te Mayonna Brown"],
    "FL-25": ["Jared Moskowitz", "Scott Singer"],
    "FL-26": ["Nicole Locklin", "Mario Díaz-Balart"],
    "FL-27": ["Eliott Rodriguez", "María Elvira Salazar"],
    "FL-28": ["Phil Ehr", "Carlos Giménez"],
    "GA-01": ["Amanda Holowell", "Jim Kingston"],
    "GA-02": ["Sanford Bishop", "Matt Day"],
    "GA-03": ["Maura Keller", "Brian Jack"],
    "GA-04": ["Hank Johnson", "James Duffie"],
    "GA-05": ["Nikema Williams", "John Oscar Salvesen"],
    "GA-06": ["Lucy McBath", "Kevin Martin"],
    "GA-07": ["Tony Kozycki", "Rich McCormick"],
    "GA-08": ["Kelly Esti", "Austin Scott"],
    "GA-09": ["Caitlyn Gegen", "Andrew Clyde"],
    "GA-10": ["Pam Delancy", "Houston Gaines"],
    "GA-11": ["Chris Harden", "John Cowan"],
    "GA-12": ["Ceretta Smith", "Rick Allen"],
    "GA-13": ["Jasmine Clark", "Jonathan Chavez"],
    "GA-14": ["Shawn Harris", "Clay Fuller"],
    "HI-01": ["Ed Case", "Adriel Lam"],
    "HI-02": ["Jill Tokuda", "Brenton Awa"],
    "IA-01": ["Christina Bohannan", "Mariannette Miller-Meeks"],
    "IA-02": ["Lindsay James", "Joe Mitchell"],
    "IA-03": ["Sarah Trone Garriott", "Zach Nunn"],
    "IA-04": ["David Dawson", "Chris McGowan"],
    "ID-01": ["Kaylee Peterson", "Russ Fulcher"],
    "ID-02": ["Ellie Gilbreath", "Mike Simpson"],
    "IL-01": ["Jonathan Jackson", "Christian Maxwell"],
    "IL-02": ["Donna Miller", "Michael Noack"],
    "IL-03": ["Delia Ramirez", "Angel Oakley"],
    "IL-04": ["Patty Garcia", "Lupe Castillo"],
    "IL-05": ["Mike Quigley", "Tommy Hanson"],
    "IL-06": ["Sean Casten", "Niki Conforti"],
    "IL-07": ["La Shawn Ford", "Chad Koppie"],
    "IL-08": ["Melissa Bean", "Jennifer Davis"],
    "IL-09": ["Daniel Biss", "John Ellesen"],
    "IL-10": ["Brad Schneider", "Carl Lambrecht"],
    "IL-11": ["Bill Foster", "Jeff Walter"],
    "IL-12": ["Julie Fortier", "Mike Bost"],
    "IL-13": ["Nikki Budzinski", "Jeff Wilson"],
    "IL-14": ["Lauren Underwood", "James Marter"],
    "IL-15": ["Jennifer Todd", "Mary Miller"],
    "IL-16": ["Paul Nolley", "Darin LaHood"],
    "IL-17": ["Eric Sorensen", "Dillan Vancil"],
    "IN-01": ["Frank Mrvan", "Barb Regnitz"],
    "IN-02": ["Jamee Decio", "Rudy Yakym"],
    "IN-03": ["Kelly Thompson", "Marlin Stutzman"],
    "IN-04": ["Drew Cox", "Jim Baird"],
    "IN-05": ["J. D. Ford", "Victoria Spartz"],
    "IN-06": ["Cinde Wirth", "Jefferson Shreve"],
    "IN-07": ["André Carson", "Patrick McAuley"],
    "IN-08": ["Mary Allen", "Mark Messmer"],
    "IN-09": ["Brad Meyer", "Erin Houchin"],
    "KS-01": ["Lauren Reinhold", "Tracey Mann"],
    "KS-02": ["Don Coover", "Derek Schmidt"],
    "KS-03": ["Sharice Davids", "Eric Jenkins"],
    "KS-04": ["Katy Tyndell", "Ron Estes"],
    "KY-01": ["Drew Williams", "James Comer"],
    "KY-02": ["Megan Wingfield", "Brett Guthrie"],
    "KY-03": ["Morgan McGarvey", "Maria Rodriquez"],
    "KY-04": ["Melissa Strange", "Ed Gallrein"],
    "KY-05": ["Ned Pillersdorf", "Hal Rogers"],
    "KY-06": ["Zach Dembo", "Ralph Alvarado"],
    "LA-01": ["Lauren Jewett", "Steve Scalise"],
    "LA-02": ["Troy Carter", "Peter Williams"],
    "LA-03": ["John Day", "Clay Higgins"],
    "LA-05": ["Dan McKay", "Michael Echols"],
    "LA-06": ["Lindsay Garcia", "Blake Miguez"],
    "MA-03": ["Lori Trahan", "Gary Grossi"],
    "MA-04": ["Jake Auchincloss", "Tom Stalcup"],
    "MA-06": ["Dan Koh", "Micah Jones"],
    "MA-08": ["Stephen Lynch", "Robert Burke"],
    "MA-09": ["Bill Keating", "Tyler MacAllister"],
    "MD-01": ["Dan Schwartz", "Andy Harris"],
    "MD-02": ["Johnny Olszewski", "Dave Wallace"],
    "MD-03": ["Sarah Elfreth", "Berney Flowers"],
    "MD-04": ["Glenn Ivey", "George McDermott"],
    "MD-05": ["Adrian Boafo", "Chris Chaffee"],
    "MD-06": ["April McClain Delaney", "Robin Ficker"],
    "MD-07": ["Kweisi Mfume", "Scott Collier"],
    "MD-08": ["Jamie Raskin", "Cheryl Riley"],
    "ME-01": ["Chellie Pingree", "Ronald Russell"],
    "ME-02": ["Matthew Dunlap", "Paul LePage"],
    "MI-01": ["Callie Barr", "Jack Bergman"],
    "MI-02": ["Ben Ambrose", "John Moolenaar"],
    "MI-03": ["Hillary Scholten", "Terri DeBoer"],
    "MI-04": ["Sean McCann", "Bill Huizenga"],
    "MI-05": ["Christian Vukasovich", "Tim Walberg"],
    "MI-06": ["Debbie Dingell", "Heather Smiley"],
    "MI-07": ["William Lawrence", "Tom Barrett"],
    "MI-08": ["Kristen McDonald Rivet", "Thomas Smith"],
    "MI-09": ["Ray Pooley", "Lisa McClain"],
    "MI-10": ["Christina Hines", "Mike Bouchard"],
    "MI-11": ["Jeremy Moss", "Ethan Baker"],
    "MI-12": ["Rashida Tlaib", "James Hooper"],
    "MI-13": ["Donavan McKilley", "T.P. Nykoriak"],
    "MN-01": ["Jake Johnson", "Brad Finstad"],
    "MN-02": ["Matt Little", "Eric Pratt"],
    "MN-03": ["Kelly Morrison", "Tyler Bass"],
    "MN-04": ["Betty McCollum", "Paul Wikstrom"],
    "MN-05": ["Ilhan Omar", "John Nagel"],
    "MN-06": ["Doug Chapin", "Tom Emmer"],
    "MN-07": ["Erik Osberg", "Michelle Fischbach"],
    "MN-08": ["Trina Swanson", "Pete Stauber"],
    "MO-01": ["Wesley Bell", "Paul Berry"],
    "MO-02": ["Fred Wellman", "Ann Wagner"],
    "MO-03": ["Bethany Mann", "Bob Onder"],
    "MO-04": ["Jordan Herrera", "Mark Alford"],
    "MO-05": ["Emanuel Cleaver", "Rick Brattin"],
    "MO-06": ["Josh Smead", "Chris Stigall"],
    "MO-07": ["Missi Hesketh", "Eric Burlison"],
    "MO-08": ["Chris Reichard", "Jason Smith"],
    "MS-01": ["Cliff Johnson", "Trent Kelly"],
    "MS-02": ["Bennie Thompson", "Ron Eller"],
    "MS-03": ["Michael Chiaradio", "Michael Guest"],
    "MS-04": ["Jeffrey Hulum III", "Mike Ezell"],
    "MT-01": ["Sam Forstag", "Aaron Flint"],
    "MT-02": ["Brian Miller", "Troy Downing"],
    "NC-01": ["Don Davis", "Laurie Buckhout"],
    "NC-02": ["Deborah Ross", "Eugene Douglass"],
    "NC-03": ["Raymond Smith Jr.", "Greg Murphy"],
    "NC-04": ["Valerie Foushee", "Max Ganorkar"],
    "NC-05": ["Chuck Hubbard", "Virginia Foxx"],
    "NC-06": ["Cyril Jefferson", "Addison McDowell"],
    "NC-07": ["Kimberly Hardy", "David Rouzer"],
    "NC-08": ["Colby Watson", "Mark Harris"],
    "NC-09": ["Richard Ojeda", "Richard Hudson"],
    "NC-10": ["Ashley Bell", "Pat Harrigan"],
    "NC-11": ["Jamie Ager", "Jennifer Balkcom"],
    "NC-12": ["Alma Adams", "Jack Codiga"],
    "NC-13": ["Paul Barringer", "Brad Knott"],
    "NC-14": ["Lakesha Womack", "Tim Moore"],
    "ND-AL": ["Trygve Hammer", "Julie Fedorchak"],
    "NE-01": ["Chris Backemeyer", "Mike Flood"],
    "NE-02": ["Denise Powell", "Brinker Harding"],
    "NE-03": ["Becky Stille", "Adrian Smith"],
    "NH-01": ["Stefany Shaheen", "Anthony DiLorenzo"],
    "NH-02": ["Maggie Goodlander", "Lily Tang Williams"],
    "NJ-01": ["Donald Norcross", "Damon Galdo"],
    "NJ-02": ["Zack Mullock", "Jeff Van Drew"],
    "NJ-03": ["Herb Conaway", "Michael McGuire"],
    "NJ-04": ["Rachel Peace", "Chris Smith"],
    "NJ-05": ["Josh Gottheimer", "Sean Kirrane"],
    "NJ-06": ["Frank Pallone", "Hillary Herzig"],
    "NJ-07": ["Rebecca Bennett", "Thomas Kean Jr."],
    "NJ-09": ["Nellie Pou", "Rosie Pino"],
    "NJ-10": ["LaMonica McIver", "Carmen Bucco"],
    "NJ-11": ["Analilia Mejia", "Joe Hathaway"],
    "NJ-12": ["Adam Hamawy", "Gregg Mele"],
    "NM-01": ["Melanie Stansbury", "Didi Okpareke"],
    "NM-02": ["Gabe Vasquez", "Greg Cunningham"],
    "NM-03": ["Teresa Leger Fernández", "Martin Zamora"],
    "NV-01": ["Dina Titus", "Carrie Buck"],
    "NV-02": ["Teresa Benitez-Thompson", "David Flippo"],
    "NV-03": ["Susie Lee", "Martin O’Donnell"],
    "NV-04": ["Steven Horsford", "Cody Whipple"],
    "NY-01": ["Chris Gallant", "Nick LaLota"],
    "NY-02": ["Patrick Halpin", "Andrew Garbarino"],
    "NY-03": ["Tom Suozzi", "Mike LiPetri"],
    "NY-04": ["Laura Gillen", "Jeanine Driscoll"],
    "NY-05": ["Gregory Meeks", "George Marsh"],
    "NY-06": ["Grace Meng", "Joseph Chou"],
    "NY-07": ["Claire Valdez", "Melvin Rivera"],
    "NY-08": ["Hakeem Jeffries", "Lewis Mizrahi"],
    "NY-09": ["Yvette Clarke", "Joel Anabilah-Azumah"],
    "NY-10": ["Brad Lander", "Jennifer Moore"],
    "NY-11": ["Michael DeCillis", "Nicole Malliotakis"],
    "NY-12": ["Micah Lasher", "Caroline Shinkle"],
    "NY-13": ["Darializa Avila Chevalier", "Jomo Williams"],
    "NY-14": ["Alexandria Ocasio-Cortez", "Diamat Hysenaj"],
    "NY-15": ["Ritchie Torres", "Stylo Sapaskis"],
    "NY-16": ["George Latimer", "Joseph Cinquemani"],
    "NY-17": ["Cait Conley", "Mike Lawler"],
    "NY-18": ["Pat Ryan", "Jacqueline Auringer"],
    "NY-19": ["Josh Riley", "Peter Oberacker"],
    "NY-20": ["Paul Tonko", "Ralph Ambrosio"],
    "NY-21": ["Blake Gendebien", "Anthony Constantino"],
    "NY-22": ["John Mannion", "Kailee Buller"],
    "NY-23": ["Aaron Gies", "Nick Langworthy"],
    "NY-24": ["Alissa Ellman", "Claudia Tenney"],
    "NY-25": ["Joseph Morelle", "Virginia McIntyre"],
    "NY-26": ["Tim Kennedy", "Dennis Hannon"],
    "OH-01": ["Greg Landsman", "Eric Conroy"],
    "OH-02": ["Jennifer Mazzuckelli", "David Taylor"],
    "OH-03": ["Joyce Beatty", "Cleophus Dulaney"],
    "OH-04": ["Joshua Kolasinski", "Jim Jordan"],
    "OH-05": ["Brian Shaver", "Bob Latta"],
    "OH-06": ["Elizabeth Kirtley", "Michael Rulli"],
    "OH-07": ["Brian Poindexter", "Max Miller"],
    "OH-08": ["Vanessa Enoch", "Warren Davidson"],
    "OH-09": ["Marcy Kaptur", "Derek Merrin"],
    "OH-10": ["Kristina Knickerbocker", "Mike Turner"],
    "OH-11": ["Shontel Brown", "Mike Kirchner"],
    "OH-12": ["Jerrad Christian", "Troy Balderson"],
    "OH-13": ["Emilia Sykes", "Carey Coleman"],
    "OH-14": ["Maria Jukic", "David Joyce"],
    "OH-15": ["Don Leonard", "Mike Carey"],
    "OK-01": ["John Croisant", "Mark Tedford"],
    "OK-02": ["Brandom Wade", "Josh Brecheen"],
    "OK-03": ["Suzie Byrd", "Frank Lucas"],
    "OK-04": ["Mitchell Jacob", "Tom Cole"],
    "OK-05": ["Jena Nelson", "Stephanie Bice"],
    "OR-01": ["Suzanne Bonamici", "Barbara Kahl"],
    "OR-02": ["Chris Beck", "Cliff Bentz"],
    "OR-03": ["Maxine Dexter", "Loran Ayles"],
    "OR-04": ["Val Hoyle", "Monique DeSpain"],
    "OR-05": ["Janelle Bynum", "Patti Adair"],
    "OR-06": ["Andrea Salinas", "David Russ"],
    "PA-01": ["Bob Harvie", "Brian Fitzpatrick"],
    "PA-02": ["Brendan Boyle", "Jessica Arriaga"],
    "PA-04": ["Madeleine Dean", "Aurora Stuski"],
    "PA-05": ["Mary Gay Scanlon", "Nicholas Manganaro"],
    "PA-06": ["Chrissy Houlaham", "Marty Young"],
    "PA-07": ["Bob Brooks", "Ryan Mackenzie"],
    "PA-08": ["Paige Cognetti", "Rob Bresnahan"],
    "PA-09": ["Rachel Wallace", "Dan Meuser"],
    "PA-10": ["Janelle Stelson", "Scott Perry"],
    "PA-11": ["Nancy Mannion", "Lloyd Smucker"],
    "PA-12": ["Summer Lee", "James Hayes"],
    "PA-13": ["Beth Farnham", "John Joyce"],
    "PA-14": ["Alan Bradstock", "Guy Reschenthaler"],
    "PA-15": ["Ray Bilger", "Glenn Thompson"],
    "PA-16": ["Justin Wagner", "Mike Kelly"],
    "PA-17": ["Chris Deluzio", "Tony Guy"],
    "RI-01": ["Gabe Amo", "Kellie Keenan"],
    "RI-02": ["Seth Magaziner", "Vic Mellor"],
    "SC-01": ["Nancy Lacore", "Jenny Costa Honeycutt"],
    "SC-02": ["Zyon Khalifa", "Joe Wilson"],
    "SC-03": ["Eunice Lehmacher", "Sheri Biggs"],
    "SC-04": ["Courtney McClain", "William Timmons"],
    "SC-05": ["Mallory Dittner", "Wes Climer"],
    "SC-06": ["Jim Clyburn", "John Peterson"],
    "SC-07": ["John Vincent", "Russel Fry"],
    "SD-AL": ["Nikki Gronli", "Marty Jackley"],
    "TN-01": ["Kristi Burke", "Diana Harshbarger"],
    "TN-02": ["Michaela Barnett", "Tim Burchett"],
    "TN-03": ["Anna Golladay", "Chuck Fleischmann"],
    "TN-04": ["Victoria Broderick", "Scott DesJarlais"],
    "TN-05": ["Chaz Molder", "Charlie Hatcher"],
    "TN-06": ["Mike Croley", "Johnny Garrett"],
    "TN-07": ["Darden Copeland", "Matt Van Epps"],
    "TN-08": ["Heidi Kuhn", "David Kustoff"],
    "TN-09": ["Justin Pearson", "Brent Taylor"],
    "TX-01": ["Yolanda Prince", "Nathaniel Moran"],
    "TX-02": ["Shaun Finnie", "Steve Toth"],
    "TX-03": ["Evan Hunt", "Keith Self"],
    "TX-04": ["Jason Pearce", "Pat Fallon"],
    "TX-05": ["Chelsey Hockett", "Lance Gooden"],
    "TX-06": ["Danny Minton", "Jake Ellzey"],
    "TX-07": ["Lizzie Fletcher", "Alexander Hale"],
    "TX-08": ["Laura Jones", "Jessica Hart Steinmann"],
    "TX-09": ["Leticia Gutierrez", "Alex Mealer"],
    "TX-10": ["Caitlin Rourk", "Chris Gober"],
    "TX-11": ["Claire Reynolds", "August Pfluger"],
    "TX-12": ["Angela Rodriguez Prilliman", "Craig Goldman"],
    "TX-13": ["Mark Nair", "Ronny Jackson"],
    "TX-14": ["Thurman Bartie", "Randy Weber"],
    "TX-15": ["Bobby Pulido", "Monica De La Cruz"],
    "TX-16": ["Veronica Escobar", "Adam Bauman"],
    "TX-17": ["Casey Shepard", "Pete Sessions"],
    "TX-18": ["Christian Menefee", "Ronald Whitfield"],
    "TX-19": ["Kyle Rable", "Tom Sell"],
    "TX-20": ["Joaquin Castro", "Edgardo Rafael Baez"],
    "TX-21": ["Kristin Hook", "Mark Teixeira"],
    "TX-22": ["Marquette Greene-Scott", "Trever Nehls"],
    "TX-23": ["Katy Padilla Stout", "Brandon Herrera"],
    "TX-24": ["Kevin Burge", "Beth Van Duyne"],
    "TX-25": ["Dione Sims", "Roger Williams"],
    "TX-26": ["Steven Shook", "Brandon Gill"],
    "TX-27": ["Tanya Lloyd", "Michael Cloud"],
    "TX-28": ["Henry Cuellar", "Tano Tijerina"],
    "TX-29": ["Sylvia Garcia", "Martha Fierro"],
    "TX-30": ["Frederick Haynes III", "Everett Jackson"],
    "TX-31": ["Justin Early", "John Carter"],
    "TX-32": ["Dan Barrios", "Jace Yarbrough"],
    "TX-33": ["Colin Allred", "Patrick Gillespie"],
    "TX-34": ["Vicente Gonzalez", "Eric Flores"],
    "TX-35": ["Johnny Garcia", "Carlos De La Cruz"],
    "TX-36": ["Rhonda Hart", "Brian Babin"],
    "TX-37": ["Greg Casar", "Lauren Peña"],
    "TX-38": ["Melissa McDonough", "Jon Bonck"],
    "UT-01": ["Ben McAdams", "Riley Owen"],
    "UT-02": ["Peter Crosby", "Blake Moore"],
    "UT-03": ["Kent Udell", "Celeste Maloy"],
    "UT-04": ["Jonny Larsen", "Mike Kennedy"],
    "VA-01": ["Shannon Taylor", "Rob Wittman"],
    "VA-02": ["Elaine Luria", "Jen Kiggans"],
    "VA-03": ["Bobby Scott", "Edwin Rivera"],
    "VA-04": ["Jennifer McClellan", "Robert Murray"],
    "VA-05": ["Tom Perriello", "John McGuire"],
    "VA-06": ["Beth Macy", "Ben Cline"],
    "VA-07": ["Eugene Vindman", "Doug Ollivant"],
    "VA-08": ["Don Beyer", "Tony Sabio"],
    "VA-09": ["Joy Powers", "Morgan Griffith"],
    "VA-10": ["Suhas Subramanyam", "Dave Beckwith"],
    "VA-11": ["James Walkinshaw", "Arthur Purves"],
    "VT-AL": ["Becca Balint", "Gerald Malloy"],
    "WA-01": ["Suzan DelBene", "Mary Silva"],
    "WA-02": ["Rick Larsen", "Edwin Feller"],
    "WA-03": ["Marie Gluesenkamp Perez", "John Braun"],
    "WA-04": ["John Duresky", "Amanda McKinney"],
    "WA-05": ["Carmela Conroy", "Michael Baumgartner"],
    "WA-06": ["Emily Randall", "Teresa Fox"],
    "WA-07": ["Pramila Jayapal", "Nirav Sheth"],
    "WA-08": ["Kim Schrier", "Spencer Meline"],
    "WA-09": ["Adam Smith", "Doug Basler"],
    "WA-10": ["Marilyn Strickland", "Chris Chung"],
    "WI-01": ["Mitchell Berman", "Bryan Steil"],
    "WI-03": ["Rebecca Cooke", "Derrick Van Orden"],
    "WI-04": ["Gwen Moore", "Tim Rogers"],
    "WI-05": ["Andrew Beck", "Scott Fitzgerald"],
    "WI-06": ["Brad Smith", "Glenn Grothman"],
    "WI-07": ["Fred Clark", "Michael Alfonso"],
    "WI-08": ["Rick Crosson", "Tony Wied"],
    "WV-01": ["Vince George", "Carol Miller"],
    "WV-02": ["Ace Parsi", "Riley Moore"],
    "WY-AL": ["Lisa Kinney", "Chuck Gray"],
  };

  const DISTRICT_RACE_OVERRIDES = {
    "AK-AL": {
      candidates: [
        { name: "Nick Begich III", party: "R" },
        { name: "Bill Hill", party: "I" },
      ],
    },
    "AZ-03": {
      candidates: [
        { name: "Yassamin Ansari", party: "D" },
        { name: "David Redkey", party: "G" },
      ],
    },
    "CA-04": {
      candidates: [
        { name: "Eric Jones", party: "D" },
        { name: "Mike Thompson", party: "D" },
      ],
    },
    "CA-06": {
      candidates: [
        { name: "Kevin Kiley", party: "I" },
        { name: "Richard Pan", party: "D" },
      ],
    },
    "CA-07": {
      candidates: [
        { name: "Doris Matsui", party: "D" },
        { name: "Mai Vang", party: "D" },
      ],
    },
    "CA-11": {
      candidates: [
        { name: "Connie Chan", party: "D" },
        { name: "Scott Wiener", party: "D" },
      ],
    },
    "CA-12": {
      candidates: [
        { name: "Jamie Joyce", party: "D" },
        { name: "Lateefah Simon", party: "D" },
      ],
    },
    "CA-14": {
      candidates: [
        { name: "Melissa Hernandez", party: "D" },
        { name: "Aisha Wahab", party: "D" },
      ],
    },
    "CA-29": {
      candidates: [
        { name: "Angelica Dueñas", party: "D" },
        { name: "Luz Rivas", party: "D" },
      ],
    },
    "CA-34": {
      candidates: [
        { name: "Jimmy Gomez", party: "D" },
        { name: "Angela Gonzales-Torres", party: "D" },
      ],
    },
    "CA-37": {
      candidates: [
        { name: "Sydney Kamlager-Dove", party: "D" },
        { name: "Samantha Mota", party: "D" },
      ],
    },
    "CA-40": {
      candidates: [
        { name: "Ken Calvert", party: "R" },
        { name: "Young Kim", party: "R" },
      ],
    },
    "FL-10": {
      candidates: [
        { name: "Maxwell Frost", party: "D" },
      ],
    },
    "LA-04": {
      candidates: [
        { name: "Conrad Cable", party: "D" },
        { name: "Matt Gromlich", party: "D" },
        { name: "Mike Johnson", party: "R" },
      ],
    },
    "MA-01": {
      candidates: [
        { name: "Nadia Milleron", party: "I" },
        { name: "Richard Neal", party: "D" },
      ],
    },
    "MA-02": {
      candidates: [
        { name: "Jim McGovern", party: "D" },
      ],
    },
    "MA-05": {
      candidates: [
        { name: "Katherine Clark", party: "D" },
      ],
    },
    "MA-07": {
      candidates: [
        { name: "Ayanna Pressley", party: "D" },
      ],
    },
    "NJ-08": {
      candidates: [
        { name: "Aristotle Eliopoulos", party: "I" },
        { name: "Rob Menendez", party: "D" },
      ],
    },
    "PA-03": {
      candidates: [
        { name: "Dennis Mahoney", party: "I" },
        { name: "Chris Rabb", party: "D" },
      ],
    },
    "WI-02": {
      candidates: [
        { name: "Mark Pocan", party: "D" },
      ],
    },
  };

  /** Senate races keyed by state postal code, same tuple / override rules. */
  const SENATE_RACES = {
    // "AZ": ["Dem Name", "Rep Name", 0],
  };

  const SENATE_RACE_OVERRIDES = {
    // "ME": {
    //   candidates: [
    //     { name: "Independent Incumbent", party: "I" },
    //     { name: "Republican Challenger", party: "R" },
    //   ],
    //   war: 2.0,
    // },
  };

  function _padId(id) {
    if (!id) return id;
    id = String(id).toUpperCase();
    const dash = id.lastIndexOf("-");
    if (dash < 0) return id;
    const state = id.slice(0, dash);
    const num = id.slice(dash + 1);
    if (num === "AL") return `${state}-AL`;
    if (/^\d+$/.test(num)) return `${state}-${num.padStart(2, "0")}`;
    return id;
  }

  function _isSenateId(id) {
    return /^[A-Z]{2}$/.test(id);
  }

  function _tablesFor(id) {
    return _isSenateId(id)
      ? { base: SENATE_RACES, overrides: SENATE_RACE_OVERRIDES }
      : { base: DISTRICT_RACES, overrides: DISTRICT_RACE_OVERRIDES };
  }

  function _numOr(v, fallback) {
    if (v == null || v === "") return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  /** True when a race row explicitly sets a special-case WAR override. */
  function _hasWarOverride(row) {
    if (!row) return false;
    if (Array.isArray(row)) return row.length >= 3 && row[2] != null && row[2] !== "";
    return row.war != null && row.war !== "";
  }

  function _warOverrideValue(row) {
    if (Array.isArray(row)) return _numOr(row[2], 0);
    return _numOr(row.war, 0);
  }

  function _baseWar(id) {
    const db = window.DISTRICT_WAR_BASE;
    if (!db || db[id] == null || db[id] === "") return 0;
    return _numOr(db[id], 0);
  }

  function _fromRow(row) {
    if (!row) return { candidates: [], warOverride: null };
    if (Array.isArray(row)) {
      const [dem, rep] = row;
      const candidates = [];
      if (dem) candidates.push({ name: String(dem), party: "D" });
      if (rep) candidates.push({ name: String(rep), party: "R" });
      return {
        candidates,
        warOverride: _hasWarOverride(row) ? _warOverrideValue(row) : null,
      };
    }
    if (Array.isArray(row.candidates)) {
      return {
        candidates: row.candidates.map((c) => ({
          name: String(c.name || ""),
          party: String(c.party || "O").toUpperCase(),
        })),
        warOverride: _hasWarOverride(row) ? _warOverrideValue(row) : null,
      };
    }
    const candidates = [];
    if (row.dem) candidates.push({ name: String(row.dem), party: "D" });
    if (row.rep) candidates.push({ name: String(row.rep), party: "R" });
    return {
      candidates,
      warOverride: _hasWarOverride(row) ? _warOverrideValue(row) : null,
    };
  }

  /** Fraction of national generic-ballot shift applied to each district (Forecast). */
  const FORECAST_SWING_ELASTICITY = 0.85;

  function _genericBallotMargin() {
    const avg = window.POLL_AVERAGE?.getAvg?.();
    if (avg != null && Number.isFinite(Number(avg))) {
      return 2 * Number(avg) - 100;
    }
    const b = window.HOUSE_2024_BASELINE;
    return b && Number.isFinite(b.nationalMargin) ? b.nationalMargin : 0;
  }

  function _normParty(party) {
    const p = String(party || "O").toUpperCase();
    if (p === "DEM" || p === "DEMOCRATIC") return "D";
    if (p === "REP" || p === "REPUBLICAN" || p === "GOP") return "R";
    if (p === "IND" || p === "INDEPENDENT") return "I";
    return p;
  }

  /**
   * Unopposed / same-party-only races → force Safe D/R (±100).
   * Independents cancel the exception; Green/Libertarian/other do not.
   * Returns +100 (D), -100 (R), or null (use normal projection).
   */
  function unopposedSafeMargin(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) return null;
    let dems = 0;
    let reps = 0;
    let hasIndie = false;
    for (const c of candidates) {
      const p = _normParty(c.party);
      if (p === "I") hasIndie = true;
      else if (p === "D") dems++;
      else if (p === "R") reps++;
    }
    if (hasIndie) return null;
    if (dems >= 1 && reps === 0) return 100;
    if (reps >= 1 && dems === 0) return -100;
    return null;
  }

  /**
   * Cautious projection:
   *   2024 district + elasticity × (generic ballot − 2024 national) + WAR
   * Default elasticity is FORECAST_SWING_ELASTICITY (0.85).
   * Unopposed / D-only or R-only (no Independent) → ±100.
   */
  function computeProjectedMargin(id, opts) {
    id = _padId(id);
    const { base: table, overrides } = _tablesFor(id);
    const row = overrides[id] || table[id];
    const forced = unopposedSafeMargin(_fromRow(row).candidates);
    if (forced != null) return forced;

    const b = window.HOUSE_2024_BASELINE;
    if (!b?.marginById || b.marginById[id] === undefined) return null;
    const base = Number(b.marginById[id]);
    const war = opts && opts.war != null ? _numOr(opts.war, 0) : getDistrictWar(id);
    const national =
      opts && opts.nationalMargin != null && Number.isFinite(Number(opts.nationalMargin))
        ? Number(opts.nationalMargin)
        : _genericBallotMargin();
    const elasticity =
      opts && opts.elasticity != null && Number.isFinite(Number(opts.elasticity))
        ? Number(opts.elasticity)
        : FORECAST_SWING_ELASTICITY;
    const shift = (national - b.nationalMargin) * elasticity;
    let projected = Math.max(-100, Math.min(100, base + shift + war));
    if (Math.abs(projected) < 0.05) projected = 0.1; // EVEN → D+0.1
    return projected;
  }

  function getDistrictWar(id) {
    id = _padId(id);
    if (!id) return 0;
    const { base, overrides } = _tablesFor(id);
    if (overrides[id] && _hasWarOverride(overrides[id])) {
      return _warOverrideValue(overrides[id]);
    }
    const row = base[id];
    if (_hasWarOverride(row)) return _warOverrideValue(row);
    return _baseWar(id);
  }

  function setDistrictWar(id, war) {
    id = _padId(id);
    const { base, overrides } = _tablesFor(id);
    const w = _numOr(war, 0);
    if (overrides[id]) {
      overrides[id].war = w;
    } else {
      const row = base[id];
      if (Array.isArray(row)) {
        base[id] = [row[0] ?? null, row[1] ?? null, w];
      } else if (row && typeof row === "object") {
        row.war = w;
      } else {
        base[id] = [null, null, w];
      }
    }
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => window.applyDistrictRatings?.());
    } else {
      setTimeout(() => window.applyDistrictRatings?.(), 0);
    }
    return getRace(id);
  }

  function clearDistrictWarOverride(id) {
    id = _padId(id);
    const { base, overrides } = _tablesFor(id);
    if (overrides[id] && "war" in overrides[id]) {
      delete overrides[id].war;
    } else {
      const row = base[id];
      if (Array.isArray(row) && row.length >= 3) {
        base[id] = [row[0] ?? null, row[1] ?? null];
      } else if (row && typeof row === "object") {
        delete row.war;
      }
    }
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => window.applyDistrictRatings?.());
    } else {
      setTimeout(() => window.applyDistrictRatings?.(), 0);
    }
    return getRace(id);
  }

  function getRace(id) {
    id = _padId(id);
    if (!id) {
      return { id: null, override: false, candidates: [], war: 0, margin: null };
    }
    const { base, overrides } = _tablesFor(id);
    const row = overrides[id] || base[id];
    const n = _fromRow(row);
    const war = getDistrictWar(id);
    return {
      id,
      override: !!overrides[id],
      candidates: n.candidates,
      war,
      warOverride: n.warOverride,
      margin: computeProjectedMargin(id, { war }),
    };
  }

  function setDistrictRace(id, dem, rep, war) {
    id = _padId(id);
    const { base } = _tablesFor(id);
    const demName = dem == null || dem === "" ? null : String(dem);
    const repName = rep == null || rep === "" ? null : String(rep);
    if (war == null || war === "") {
      base[id] = [demName, repName];
    } else {
      base[id] = [demName, repName, _numOr(war, 0)];
    }
    return getRace(id);
  }

  function overrideDistrictRace(id, spec) {
    id = _padId(id);
    if (!spec || typeof spec !== "object") {
      throw new Error("overrideDistrictRace(id, spec) requires a spec object");
    }
    const { overrides } = _tablesFor(id);
    const candidates = Array.isArray(spec.candidates)
      ? spec.candidates.map((c) => ({
          name: String(c.name || ""),
          party: String(c.party || "O").toUpperCase(),
        }))
      : [];
    const entry = { candidates };
    if (spec.war != null && spec.war !== "") {
      entry.war = _numOr(spec.war, 0);
    }
    overrides[id] = entry;
    return getRace(id);
  }

  function clearDistrictRaceOverride(id) {
    id = _padId(id);
    const { overrides } = _tablesFor(id);
    delete overrides[id];
    return getRace(id);
  }

  function formatMargin(m) {
    if (m == null || m === "" || !Number.isFinite(Number(m))) return "—";
    m = Number(m);
    if (Math.abs(m) < 0.05) return "EVEN";
    const side = m > 0 ? "D" : "R";
    const abs = Math.abs(m);
    const text = abs >= 10 ? abs.toFixed(0) : abs.toFixed(1);
    return `${side}+${text}`;
  }

  function partyClass(party) {
    const p = String(party || "O").toUpperCase();
    if (p === "D" || p === "DEM" || p === "DEMOCRATIC") return "dem";
    if (p === "R" || p === "REP" || p === "REPUBLICAN" || p === "GOP") return "rep";
    if (p === "I" || p === "IND" || p === "INDEPENDENT") return "ind";
    return "other";
  }

  function partyBadge(party) {
    const p = String(party || "O").toUpperCase();
    if (PARTY_LABEL[p]) return PARTY_LABEL[p];
    if (p === "DEM" || p === "DEMOCRATIC") return "D";
    if (p === "REP" || p === "REPUBLICAN" || p === "GOP") return "R";
    if (p === "IND" || p === "INDEPENDENT") return "I";
    return p.slice(0, 1) || "?";
  }

  window.DISTRICT_RACES = DISTRICT_RACES;
  window.DISTRICT_RACE_OVERRIDES = DISTRICT_RACE_OVERRIDES;
  window.SENATE_RACES = SENATE_RACES;
  window.SENATE_RACE_OVERRIDES = SENATE_RACE_OVERRIDES;
  window.getRace = getRace;
  window.getDistrictWar = getDistrictWar;
  window.setDistrictWar = setDistrictWar;
  window.clearDistrictWarOverride = clearDistrictWarOverride;
  window.setDistrictRace = setDistrictRace;
  window.overrideDistrictRace = overrideDistrictRace;
  window.clearDistrictRaceOverride = clearDistrictRaceOverride;
  window.computeProjectedMargin = computeProjectedMargin;
  window.unopposedSafeMargin = unopposedSafeMargin;
  window.formatRaceMargin = formatMargin;
  window.racePartyClass = partyClass;
  window.racePartyBadge = partyBadge;
})();
