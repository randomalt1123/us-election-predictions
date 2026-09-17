/**
 * Per-district (and Senate) race data for map tooltips.
 *
 * Default encoding — object keyed by id, value is a 3-tuple:
 *   [democraticCandidate, republicanCandidate, war]
 *
 *   war = Wins Above Replacement in D−R points (default 0).
 *   Positive WAR helps Democrats; negative helps Republicans.
 *
 * Projected margin is computed (not stored):
 *   projected = 2024DistrictMargin
 *             + (genericBallotMargin − 2024NationalMargin)
 *             + war
 *
 * Full swing, no damping. Generic ballot comes from POLL_AVERAGE.
 *
 * Example:
 *   DISTRICT_RACES["AZ-01"] = ["Amish Shah", "Jay Feely", 1.5];
 *
 * Nonstandard races (R vs R, D vs D, independent, etc.) go in
 * DISTRICT_RACE_OVERRIDES — same war field, default 0.
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

  /** @type {Record<string, [string|null, string|null, number]>} */
  const DISTRICT_RACES = {
    "AL-01": ["Clyde Jones Jr.", "Jerry Carl", 0],
    "AL-02": ["Shomari Figures", "Rhett Marques", 0],
    "AL-03": ["Lee McInnis", "Mike Rogers", 0],
    "AL-04": ["Amanda Pusczek", "Robert Aderholt", 0],
    "AL-05": ["Andrew Sneed", "Dale Strong", 0],
    "AL-06": ["Maurice Mercer", "Gary Palmer", 0],
    "AL-07": ["Terri Sewell", "Ammie Akin", 0],
    "AR-01": ["Terri Green", "Rick Crawford", 0],
    "AR-02": ["Chris Jones", "French Hill", 0],
    "AR-03": ["Robb Ryerse", "Steve Womack", 0],
    "AR-04": ["James Russell", "Bruce Westerman", 0],
    "AZ-01": ["Amish Shah", "Jay Feely", 0],
    "AZ-02": ["Jonathan Nez", "Eli Crane", 0],
    "AZ-04": ["Greg Stanton", "Zudhi Jasser", 0],
    "AZ-05": ["Elizabeth Lee", "Mark Lamb", 0],
    "AZ-06": ["JoAnna Mendoza", "Juan Ciscomani", 0],
    "AZ-07": ["Adelita Grijalva", "Daniel Butierez", 0],
    "AZ-08": ["Bernadette Greene-Placentia", "Abraham Hamadeh", 0],
    "AZ-09": ["Dani Sterbinsky", "Paul Gosar", 0],
    "CA-01": ["Mike McGuire", "James Gallagher", 0],
    "CA-02": ["Jared Huffman", "Robin Littau", 0],
    "CA-03": ["Ami Bera", "Robb Tucker", 0],
    "CA-05": ["Michael Masuda", "Tom McClintock", 0],
    "CA-08": ["John Garamendi", "Rudy Recile", 0],
    "CA-09": ["Josh Harder", "John McBride", 0],
    "CA-10": ["Mark DeSaulnier", "Jeff Frese", 0],
    "CA-13": ["Adam Gray", "Kevin Lincoln", 0],
    "CA-15": ["Kevin Mullin", "Charles Hoelter", 0],
    "CA-16": ["Sam Liccardo", "Peter Soulé", 0],
    "CA-17": ["Ro Khanna", "Ritesh Tandon", 0],
    "CA-18": ["Zoe Lofgren", "Shane Lewis", 0],
    "CA-19": ["Jimmy Panetta", "Peter Coe Verbica", 0],
    "CA-20": ["Sandra Van Scotter", "Vince Fong", 0],
    "CA-21": ["Jim Costa", "Kyle Kirkland", 0],
    "CA-22": ["Randy Villegas", "David Valadao", 0],
    "CA-23": ["Tessa Lynn Hodge", "Jay Obernolte", 0],
    "CA-24": ["Salud Carbajal", "Bob Smith", 0],
    "CA-25": ["Raul Ruiz", "Joe Males", 0],
    "CA-26": ["Jacqui Irwin", "Sam Gallucci", 0],
    "CA-27": ["George Whitesides", "Jason Gibbs", 0],
    "CA-28": ["Judy Chu", "April Verlato", 0],
    "CA-30": ["Laura Friedman", "Scott Meyers", 0],
    "CA-31": ["Gil Cisneros", "Eric Ching", 0],
    "CA-32": ["Brad Sherman", "Larry Thompson", 0],
    "CA-33": ["Pete Aguilar", "Stephanie Vargas", 0],
    "CA-35": ["Norma Torres", "Mike Cargile", 0],
    "CA-36": ["Ted Lieu", "Houston Brignano", 0],
    "CA-38": ["Hilda Solis", "Pedro Casas", 0],
    "CA-39": ["Mark Takano", "Steve Manos", 0],
    "CA-41": ["Linda Sánchez", "Mitch Clemmons", 0],
    "CA-42": ["Robert Garcia", "Brian Burley", 0],
    "CA-43": ["Maxine Waters", "Christian Morales", 0],
    "CA-44": ["Nanette Barragán", "Genevieve Angel", 0],
    "CA-45": ["Derek Tran", "Chuong Vo", 0],
    "CA-46": ["Lou Correa", "David Pan", 0],
    "CA-47": ["Dave Min", "Jenny Le Roux", 0],
    "CA-48": ["Marni von Wilpert", "Jim Desmond", 0],
    "CA-49": ["Mike Levin", "Armen Kurdian", 0],
    "CA-50": ["Scott Peters", "Steve Cohen", 0],
    "CA-51": ["Sara Jacobs", "Ricardo Cabrera", 0],
    "CA-52": ["Juan Vargas", "Jeff Belle", 0],
    "CO-01": ["Melat Kiros", "Christy Peterson", 0],
    "CO-02": ["Joe Neguse", "Kelley Dennison", 0],
    "CO-03": ["Dwayne Romero", "Jeff Hurd", 0],
    "CO-04": ["Eileen Laubaucher", "Lauren Boebert", 0],
    "CO-05": ["Jessica Killin", "Jeff Crank", 0],
    "CO-06": ["Jason Crow", "Jason Clark", 0],
    "CO-07": ["Brittany Pettersen", "Tim Bennett", 0],
    "CO-08": ["Manny Rutinel", "Gabe Evans", 0],
    "CT-01": ["Luke Bronin", "Amy Chai", 0],
    "CT-02": ["Joe Courtney", "George Austin", 0],
    "CT-03": ["Rosa DeLauro", "Chris Lancia", 0],
    "CT-04": ["Jim Himes", "Michael Goldstein", 0],
    "CT-05": ["Jahana Hayes", "Chris Shea", 0],
    "DE-AL": ["Sarah McBride", "Joseph Arminio", 0],
    "FL-01": ["Gay Valimont", "Jimmy Patronis", 0],
    "FL-02": ["Amanda Green", "Austin Rogers", 0],
    "FL-03": ["Seth Harp", "Kat Cammack", 0],
    "FL-04": ["LaShonda Holloway", "Aaron Bean", 0],
    "FL-05": ["Rachel Grage", "John Rutherford", 0],
    "FL-06": ["Eric Yonce", "Randy Fine", 0],
    "FL-07": ["Bale Dalton", "Ryan Elijah", 0],
    "FL-08": ["Jennifer Jenkins", "Mike Haridopolos", 0],
    "FL-09": ["Darren Soto", "Dan Green", 0],
    "FL-11": ["James Pericola", "Joe Strada", 0],
    "FL-12": ["Kimberly Overman", "Gus Bilirakis", 0],
    "FL-13": ["Leela Gray", "Anna Paulina Luna", 0],
    "FL-14": ["Kathy Castor", "Mike Beltran", 0],
    "FL-15": ["Robert People", "Laurel Lee", 0],
    "FL-16": ["Kelly Kirschner", "Sydney Gruters", 0],
    "FL-17": ["Matthew Montavon", "Greg Steube", 0],
    "FL-18": ["Curtis Gibson", "Scott Franklin", 0],
    "FL-19": ["Victor Arias", "Jim Schwartzel", 0],
    "FL-20": ["Debbie Wasserman Schultz", "Brent Andersen", 0],
    "FL-21": ["James Martin", "Brian Mast", 0],
    "FL-22": ["Pia Dandiya", "Casey Askar", 0],
    "FL-23": ["Lois Frankel", "Deborah Adeimy", 0],
    "FL-24": ["Oliver Gilbert", "Te Mayonna Brown", 0],
    "FL-25": ["Jared Moskowitz", "Scott Singer", 0],
    "FL-26": ["Nicole Locklin", "Mario Díaz-Balart", 0],
    "FL-27": ["Eliott Rodriguez", "María Elvira Salazar", 0],
    "FL-28": ["Phil Ehr", "Carlos Giménez", 0],
    "GA-01": ["Amanda Holowell", "Jim Kingston", 0],
    "GA-02": ["Sanford Bishop", "Matt Day", 0],
    "GA-03": ["Maura Keller", "Brian Jack", 0],
    "GA-04": ["Hank Johnson", "James Duffie", 0],
    "GA-05": ["Nikema Williams", "John Oscar Salvesen", 0],
    "GA-06": ["Lucy McBath", "Kevin Martin", 0],
    "GA-07": ["Tony Kozycki", "Rich McCormick", 0],
    "GA-08": ["Kelly Esti", "Austin Scott", 0],
    "GA-09": ["Caitlyn Gegen", "Andrew Clyde", 0],
    "GA-10": ["Pam Delancy", "Houston Gaines", 0],
    "GA-11": ["Chris Harden", "John Cowan", 0],
    "GA-12": ["Ceretta Smith", "Rick Allen", 0],
    "GA-13": ["Jasmine Clark", "Jonathan Chavez", 0],
    "GA-14": ["Shawn Harris", "Clay Fuller", 0],
    "HI-01": ["Ed Case", "Adriel Lam", 0],
    "HI-02": ["Jill Tokuda", "Brenton Awa", 0],
    "IA-01": ["Christina Bohannan", "Mariannette Miller-Meeks", 0],
    "IA-02": ["Lindsay James", "Joe Mitchell", 0],
    "IA-03": ["Sarah Trone Garriott", "Zach Nunn", 0],
    "IA-04": ["David Dawson", "Chris McGowan", 0],
    "ID-01": ["Kaylee Peterson", "Russ Fulcher", 0],
    "ID-02": ["Ellie Gilbreath", "Mike Simpson", 0],
    "IL-01": ["Jonathan Jackson", "Christian Maxwell", 0],
    "IL-02": ["Donna Miller", "Michael Noack", 0],
    "IL-03": ["Delia Ramirez", "Angel Oakley", 0],
    "IL-04": ["Patty Garcia", "Lupe Castillo", 0],
    "IL-05": ["Mike Quigley", "Tommy Hanson", 0],
    "IL-06": ["Sean Casten", "Niki Conforti", 0],
    "IL-07": ["La Shawn Ford", "Chad Koppie", 0],
    "IL-08": ["Melissa Bean", "Jennifer Davis", 0],
    "IL-09": ["Daniel Biss", "John Ellesen", 0],
    "IL-10": ["Brad Schneider", "Carl Lambrecht", 0],
    "IL-11": ["Bill Foster", "Jeff Walter", 0],
    "IL-12": ["Julie Fortier", "Mike Bost", 0],
    "IL-13": ["Nikki Budzinski", "Jeff Wilson", 0],
    "IL-14": ["Lauren Underwood", "James Marter", 0],
    "IL-15": ["Jennifer Todd", "Mary Miller", 0],
    "IL-16": ["Paul Nolley", "Darin LaHood", 0],
    "IL-17": ["Eric Sorensen", "Dillan Vancil", 0],
    "IN-01": ["Frank Mrvan", "Barb Regnitz", 0],
    "IN-02": ["Jamee Decio", "Rudy Yakym", 0],
    "IN-03": ["Kelly Thompson", "Marlin Stutzman", 0],
    "IN-04": ["Drew Cox", "Jim Baird", 0],
    "IN-05": ["J. D. Ford", "Victoria Spartz", 0],
    "IN-06": ["Cinde Wirth", "Jefferson Shreve", 0],
    "IN-07": ["André Carson", "Patrick McAuley", 0],
    "IN-08": ["Mary Allen", "Mark Messmer", 0],
    "IN-09": ["Brad Meyer", "Erin Houchin", 0],
    "KS-01": ["Lauren Reinhold", "Tracey Mann", 0],
    "KS-02": ["Don Coover", "Derek Schmidt", 0],
    "KS-03": ["Sharice Davids", "Eric Jenkins", 0],
    "KS-04": ["Katy Tyndell", "Ron Estes", 0],
    "KY-01": ["Drew Williams", "James Comer", 0],
    "KY-02": ["Megan Wingfield", "Brett Guthrie", 0],
    "KY-03": ["Morgan McGarvey", "Maria Rodriquez", 0],
    "KY-04": ["Melissa Strange", "Ed Gallrein", 0],
    "KY-05": ["Ned Pillersdorf", "Hal Rogers", 0],
    "KY-06": ["Zach Dembo", "Ralph Alvarado", 0],
    "LA-01": ["Lauren Jewett", "Steve Scalise", 0],
    "LA-02": ["Troy Carter", "Peter Williams", 0],
    "LA-03": ["John Day", "Clay Higgins", 0],
    "LA-05": ["Dan McKay", "Michael Echols", 0],
    "LA-06": ["Lindsay Garcia", "Blake Miguez", 0],
    "MA-03": ["Lori Trahan", "Gary Grossi", 0],
    "MA-04": ["Jake Auchincloss", "Tom Stalcup", 0],
    "MA-06": ["Dan Koh", "Micah Jones", 0],
    "MA-08": ["Stephen Lynch", "Robert Burke", 0],
    "MA-09": ["Bill Keating", "Tyler MacAllister", 0],
    "MD-01": ["Dan Schwartz", "Andy Harris", 0],
    "MD-02": ["Johnny Olszewski", "Dave Wallace", 0],
    "MD-03": ["Sarah Elfreth", "Berney Flowers", 0],
    "MD-04": ["Glenn Ivey", "George McDermott", 0],
    "MD-05": ["Adrian Boafo", "Chris Chaffee", 0],
    "MD-06": ["April McClain Delaney", "Robin Ficker", 0],
    "MD-07": ["Kweisi Mfume", "Scott Collier", 0],
    "MD-08": ["Jamie Raskin", "Cheryl Riley", 0],
    "ME-01": ["Chellie Pingree", "Ronald Russell", 0],
    "ME-02": ["Matthew Dunlap", "Paul LePage", 0],
    "MI-01": ["Callie Barr", "Jack Bergman", 0],
    "MI-02": ["Ben Ambrose", "John Moolenaar", 0],
    "MI-03": ["Hillary Scholten", "Terri DeBoer", 0],
    "MI-04": ["Sean McCann", "Bill Huizenga", 0],
    "MI-05": ["Christian Vukasovich", "Tim Walberg", 0],
    "MI-06": ["Debbie Dingell", "Heather Smiley", 0],
    "MI-07": ["William Lawrence", "Tom Barrett", 0],
    "MI-08": ["Kristen McDonald Rivet", "Thomas Smith", 0],
    "MI-09": ["Ray Pooley", "Lisa McClain", 0],
    "MI-10": ["Christina Hines", "Mike Bouchard", 0],
    "MI-11": ["Jeremy Moss", "Ethan Baker", 0],
    "MI-12": ["Rashida Tlaib", "James Hooper", 0],
    "MI-13": ["Donavan McKilley", "T.P. Nykoriak", 0],
    "MN-01": ["Jake Johnson", "Brad Finstad", 0],
    "MN-02": ["Matt Little", "Eric Pratt", 0],
    "MN-03": ["Kelly Morrison", "Tyler Bass", 0],
    "MN-04": ["Betty McCollum", "Paul Wikstrom", 0],
    "MN-05": ["Ilhan Omar", "John Nagel", 0],
    "MN-06": ["Doug Chapin", "Tom Emmer", 0],
    "MN-07": ["Erik Osberg", "Michelle Fischbach", 0],
    "MN-08": ["Trina Swanson", "Pete Stauber", 0],
    "MO-01": ["Wesley Bell", "Paul Berry", 0],
    "MO-02": ["Fred Wellman", "Ann Wagner", 0],
    "MO-03": ["Bethany Mann", "Bob Onder", 0],
    "MO-04": ["Jordan Herrera", "Mark Alford", 0],
    "MO-05": ["Emanuel Cleaver", "Rick Brattin", 0],
    "MO-06": ["Josh Smead", "Chris Stigall", 0],
    "MO-07": ["Missi Hesketh", "Eric Burlison", 0],
    "MO-08": ["Chris Reichard", "Jason Smith", 0],
    "MS-01": ["Cliff Johnson", "Trent Kelly", 0],
    "MS-02": ["Bennie Thompson", "Ron Eller", 0],
    "MS-03": ["Michael Chiaradio", "Michael Guest", 0],
    "MS-04": ["Jeffrey Hulum III", "Mike Ezell", 0],
    "MT-01": ["Sam Forstag", "Aaron Flint", 0],
    "MT-02": ["Brian Miller", "Troy Downing", 0],
    "NC-01": ["Don Davis", "Laurie Buckhout", 0],
    "NC-02": ["Deborah Ross", "Eugene Douglass", 0],
    "NC-03": ["Raymond Smith Jr.", "Greg Murphy", 0],
    "NC-04": ["Valerie Foushee", "Max Ganorkar", 0],
    "NC-05": ["Chuck Hubbard", "Virginia Foxx", 0],
    "NC-06": ["Cyril Jefferson", "Addison McDowell", 0],
    "NC-07": ["Kimberly Hardy", "David Rouzer", 0],
    "NC-08": ["Colby Watson", "Mark Harris", 0],
    "NC-09": ["Richard Ojeda", "Richard Hudson", 0],
    "NC-10": ["Ashley Bell", "Pat Harrigan", 0],
    "NC-11": ["Jamie Ager", "Jennifer Balkcom", 0],
    "NC-12": ["Alma Adams", "Jack Codiga", 0],
    "NC-13": ["Paul Barringer", "Brad Knott", 0],
    "NC-14": ["Lakesha Womack", "Tim Moore", 0],
    "ND-AL": ["Trygve Hammer", "Julie Fedorchak", 0],
    "NE-01": ["Chris Backemeyer", "Mike Flood", 0],
    "NE-02": ["Denise Powell", "Brinker Harding", 0],
    "NE-03": ["Becky Stille", "Adrian Smith", 0],
    "NH-01": ["Stefany Shaheen", "Anthony DiLorenzo", 0],
    "NH-02": ["Maggie Goodlander", "Lily Tang Williams", 0],
    "NJ-01": ["Donald Norcross", "Damon Galdo", 0],
    "NJ-02": ["Zack Mullock", "Jeff Van Drew", 0],
    "NJ-03": ["Herb Conaway", "Michael McGuire", 0],
    "NJ-04": ["Rachel Peace", "Chris Smith", 0],
    "NJ-05": ["Josh Gottheimer", "Sean Kirrane", 0],
    "NJ-06": ["Frank Pallone", "Hillary Herzig", 0],
    "NJ-07": ["Rebecca Bennett", "Thomas Kean Jr.", 0],
    "NJ-09": ["Nellie Pou", "Rosie Pino", 0],
    "NJ-10": ["LaMonica McIver", "Carmen Bucco", 0],
    "NJ-11": ["Analilia Mejia", "Joe Hathaway", 0],
    "NJ-12": ["Adam Hamawy", "Gregg Mele", 0],
    "NM-01": ["Melanie Stansbury", "Didi Okpareke", 0],
    "NM-02": ["Gabe Vasquez", "Greg Cunningham", 0],
    "NM-03": ["Teresa Leger Fernández", "Martin Zamora", 0],
    "NV-01": ["Dina Titus", "Carrie Buck", 0],
    "NV-02": ["Teresa Benitez-Thompson", "David Flippo", 0],
    "NV-03": ["Susie Lee", "Martin O’Donnell", 0],
    "NV-04": ["Steven Horsford", "Cody Whipple", 0],
    "NY-01": ["Chris Gallant", "Nick LaLota", 0],
    "NY-02": ["Patrick Halpin", "Andrew Garbarino", 0],
    "NY-03": ["Tom Suozzi", "Mike LiPetri", 0],
    "NY-04": ["Laura Gillen", "Jeanine Driscoll", 0],
    "NY-05": ["Gregory Meeks", "George Marsh", 0],
    "NY-06": ["Grace Meng", "Joseph Chou", 0],
    "NY-07": ["Claire Valdez", "Melvin Rivera", 0],
    "NY-08": ["Hakeem Jeffries", "Lewis Mizrahi", 0],
    "NY-09": ["Yvette Clarke", "Joel Anabilah-Azumah", 0],
    "NY-10": ["Brad Lander", "Jennifer Moore", 0],
    "NY-11": ["Michael DeCillis", "Nicole Malliotakis", 0],
    "NY-12": ["Micah Lasher", "Caroline Shinkle", 0],
    "NY-13": ["Darializa Avila Chevalier", "Jomo Williams", 0],
    "NY-14": ["Alexandria Ocasio-Cortez", "Diamat Hysenaj", 0],
    "NY-15": ["Ritchie Torres", "Stylo Sapaskis", 0],
    "NY-16": ["George Latimer", "Joseph Cinquemani", 0],
    "NY-17": ["Cait Conley", "Mike Lawler", 0],
    "NY-18": ["Pat Ryan", "Jacqueline Auringer", 0],
    "NY-19": ["Josh Riley", "Peter Oberacker", 0],
    "NY-20": ["Paul Tonko", "Ralph Ambrosio", 0],
    "NY-21": ["Blake Gendebien", "Anthony Constantino", 0],
    "NY-22": ["John Mannion", "Kailee Buller", 0],
    "NY-23": ["Aaron Gies", "Nick Langworthy", 0],
    "NY-24": ["Alissa Ellman", "Claudia Tenney", 0],
    "NY-25": ["Joseph Morelle", "Virginia McIntyre", 0],
    "NY-26": ["Tim Kennedy", "Dennis Hannon", 0],
    "OH-01": ["Greg Landsman", "Eric Conroy", 0],
    "OH-02": ["Jennifer Mazzuckelli", "David Taylor", 0],
    "OH-03": ["Joyce Beatty", "Cleophus Dulaney", 0],
    "OH-04": ["Joshua Kolasinski", "Jim Jordan", 0],
    "OH-05": ["Brian Shaver", "Bob Latta", 0],
    "OH-06": ["Elizabeth Kirtley", "Michael Rulli", 0],
    "OH-07": ["Brian Poindexter", "Max Miller", 0],
    "OH-08": ["Vanessa Enoch", "Warren Davidson", 0],
    "OH-09": ["Marcy Kaptur", "Derek Merrin", 0],
    "OH-10": ["Kristina Knickerbocker", "Mike Turner", 0],
    "OH-11": ["Shontel Brown", "Mike Kirchner", 0],
    "OH-12": ["Jerrad Christian", "Troy Balderson", 0],
    "OH-13": ["Emilia Sykes", "Carey Coleman", 0],
    "OH-14": ["Maria Jukic", "David Joyce", 0],
    "OH-15": ["Don Leonard", "Mike Carey", 0],
    "OK-01": ["John Croisant", "Mark Tedford", 0],
    "OK-02": ["Brandom Wade", "Josh Brecheen", 0],
    "OK-03": ["Suzie Byrd", "Frank Lucas", 0],
    "OK-04": ["Mitchell Jacob", "Tom Cole", 0],
    "OK-05": ["Jena Nelson", "Stephanie Bice", 0],
    "OR-01": ["Suzanne Bonamici", "Barbara Kahl", 0],
    "OR-02": ["Chris Beck", "Cliff Bentz", 0],
    "OR-03": ["Maxine Dexter", "Loran Ayles", 0],
    "OR-04": ["Val Hoyle", "Monique DeSpain", 0],
    "OR-05": ["Janelle Bynum", "Patti Adair", 0],
    "OR-06": ["Andrea Salinas", "David Russ", 0],
    "PA-01": ["Bob Harvie", "Brian Fitzpatrick", 0],
    "PA-02": ["Brendan Boyle", "Jessica Arriaga", 0],
    "PA-04": ["Madeleine Dean", "Aurora Stuski", 0],
    "PA-05": ["Mary Gay Scanlon", "Nicholas Manganaro", 0],
    "PA-06": ["Chrissy Houlaham", "Marty Young", 0],
    "PA-07": ["Bob Brooks", "Ryan Mackenzie", 0],
    "PA-08": ["Paige Cognetti", "Rob Bresnahan", 0],
    "PA-09": ["Rachel Wallace", "Dan Meuser", 0],
    "PA-10": ["Janelle Stelson", "Scott Perry", 0],
    "PA-11": ["Nancy Mannion", "Lloyd Smucker", 0],
    "PA-12": ["Summer Lee", "James Hayes", 0],
    "PA-13": ["Beth Farnham", "John Joyce", 0],
    "PA-14": ["Alan Bradstock", "Guy Reschenthaler", 0],
    "PA-15": ["Ray Bilger", "Glenn Thompson", 0],
    "PA-16": ["Justin Wagner", "Mike Kelly", 0],
    "PA-17": ["Chris Deluzio", "Tony Guy", 0],
    "RI-01": ["Gabe Amo", "Kellie Keenan", 0],
    "RI-02": ["Seth Magaziner", "Vic Mellor", 0],
    "SC-01": ["Nancy Lacore", "Jenny Costa Honeycutt", 0],
    "SC-02": ["Zyon Khalifa", "Joe Wilson", 0],
    "SC-03": ["Eunice Lehmacher", "Sheri Biggs", 0],
    "SC-04": ["Courtney McClain", "William Timmons", 0],
    "SC-05": ["Mallory Dittner", "Wes Climer", 0],
    "SC-06": ["Jim Clyburn", "John Peterson", 0],
    "SC-07": ["John Vincent", "Russel Fry", 0],
    "SD-AL": ["Nikki Gronli", "Marty Jackley", 0],
    "TN-01": ["Kristi Burke", "Diana Harshbarger", 0],
    "TN-02": ["Michaela Barnett", "Tim Burchett", 0],
    "TN-03": ["Anna Golladay", "Chuck Fleischmann", 0],
    "TN-04": ["Victoria Broderick", "Scott DesJarlais", 0],
    "TN-05": ["Chaz Molder", "Charlie Hatcher", 0],
    "TN-06": ["Mike Croley", "Johnny Garrett", 0],
    "TN-07": ["Darden Copeland", "Matt Van Epps", 0],
    "TN-08": ["Heidi Kuhn", "David Kustoff", 0],
    "TN-09": ["Justin Pearson", "Brent Taylor", 0],
    "TX-01": ["Yolanda Prince", "Nathaniel Moran", 0],
    "TX-02": ["Shaun Finnie", "Steve Toth", 0],
    "TX-03": ["Evan Hunt", "Keith Self", 0],
    "TX-04": ["Jason Pearce", "Pat Fallon", 0],
    "TX-05": ["Chelsey Hockett", "Lance Gooden", 0],
    "TX-06": ["Danny Minton", "Jake Ellzey", 0],
    "TX-07": ["Lizzie Fletcher", "Alexander Hale", 0],
    "TX-08": ["Laura Jones", "Jessica Hart Steinmann", 0],
    "TX-09": ["Leticia Gutierrez", "Alex Mealer", 0],
    "TX-10": ["Caitlin Rourk", "Chris Gober", 0],
    "TX-11": ["Claire Reynolds", "August Pfluger", 0],
    "TX-12": ["Angela Rodriguez Prilliman", "Craig Goldman", 0],
    "TX-13": ["Mark Nair", "Ronny Jackson", 0],
    "TX-14": ["Thurman Bartie", "Randy Weber", 0],
    "TX-15": ["Bobby Pulido", "Monica De La Cruz", 0],
    "TX-16": ["Veronica Escobar", "Adam Bauman", 0],
    "TX-17": ["Casey Shepard", "Pete Sessions", 0],
    "TX-18": ["Christian Menefee", "Ronald Whitfield", 0],
    "TX-19": ["Kyle Rable", "Tom Sell", 0],
    "TX-20": ["Joaquin Castro", "Edgardo Rafael Baez", 0],
    "TX-21": ["Kristin Hook", "Mark Teixeira", 0],
    "TX-22": ["Marquette Greene-Scott", "Trever Nehls", 0],
    "TX-23": ["Katy Padilla Stout", "Brandon Herrera", 0],
    "TX-24": ["Kevin Burge", "Beth Van Duyne", 0],
    "TX-25": ["Dione Sims", "Roger Williams", 0],
    "TX-26": ["Steven Shook", "Brandon Gill", 0],
    "TX-27": ["Tanya Lloyd", "Michael Cloud", 0],
    "TX-28": ["Henry Cuellar", "Tano Tijerina", 0],
    "TX-29": ["Sylvia Garcia", "Martha Fierro", 0],
    "TX-30": ["Frederick Haynes III", "Everett Jackson", 0],
    "TX-31": ["Justin Early", "John Carter", 0],
    "TX-32": ["Dan Barrios", "Jace Yarbrough", 0],
    "TX-33": ["Colin Allred", "Patrick Gillespie", 0],
    "TX-34": ["Vicente Gonzalez", "Eric Flores", 0],
    "TX-35": ["Johnny Garcia", "Carlos De La Cruz", 0],
    "TX-36": ["Rhonda Hart", "Brian Babin", 0],
    "TX-37": ["Greg Casar", "Lauren Peña", 0],
    "TX-38": ["Melissa McDonough", "Jon Bonck", 0],
    "UT-01": ["Ben McAdams", "Riley Owen", 0],
    "UT-02": ["Peter Crosby", "Blake Moore", 0],
    "UT-03": ["Kent Udell", "Celeste Maloy", 0],
    "UT-04": ["Jonny Larsen", "Mike Kennedy", 0],
    "VA-01": ["Shannon Taylor", "Rob Wittman", 0],
    "VA-02": ["Elaine Luria", "Jen Kiggans", 0],
    "VA-03": ["Bobby Scott", "Edwin Rivera", 0],
    "VA-04": ["Jennifer McClellan", "Robert Murray", 0],
    "VA-05": ["Tom Perriello", "John McGuire", 0],
    "VA-06": ["Beth Macy", "Ben Cline", 0],
    "VA-07": ["Eugene Vindman", "Doug Ollivant", 0],
    "VA-08": ["Don Beyer", "Tony Sabio", 0],
    "VA-09": ["Joy Powers", "Morgan Griffith", 0],
    "VA-10": ["Suhas Subramanyam", "Dave Beckwith", 0],
    "VA-11": ["James Walkinshaw", "Arthur Purves", 0],
    "VT-AL": ["Becca Balint", "Gerald Malloy", 0],
    "WA-01": ["Suzan DelBene", "Mary Silva", 0],
    "WA-02": ["Rick Larsen", "Edwin Feller", 0],
    "WA-03": ["Marie Gluesenkamp Perez", "John Braun", 0],
    "WA-04": ["John Duresky", "Amanda McKinney", 0],
    "WA-05": ["Carmela Conroy", "Michael Baumgartner", 0],
    "WA-06": ["Emily Randall", "Teresa Fox", 0],
    "WA-07": ["Pramila Jayapal", "Nirav Sheth", 0],
    "WA-08": ["Kim Schrier", "Spencer Meline", 0],
    "WA-09": ["Adam Smith", "Doug Basler", 0],
    "WA-10": ["Marilyn Strickland", "Chris Chung", 0],
    "WI-01": ["Mitchell Berman", "Bryan Steil", 0],
    "WI-03": ["Rebecca Cooke", "Derrick Van Orden", 0],
    "WI-04": ["Gwen Moore", "Tim Rogers", 0],
    "WI-05": ["Andrew Beck", "Scott Fitzgerald", 0],
    "WI-06": ["Brad Smith", "Glenn Grothman", 0],
    "WI-07": ["Fred Clark", "Michael Alfonso", 0],
    "WI-08": ["Rick Crosson", "Tony Wied", 0],
    "WV-01": ["Vince George", "Carol Miller", 0],
    "WV-02": ["Ace Parsi", "Riley Moore", 0],
    "WY-AL": ["Lisa Kinney", "Chuck Gray", 0],
  };

  const DISTRICT_RACE_OVERRIDES = {
    "AK-AL": {
      candidates: [
        { name: "Nick Begich III", party: "R" },
        { name: "Bill Hill", party: "I" },
      ],
      war: 0,
    },
    "AZ-03": {
      candidates: [
        { name: "Yassamin Ansari", party: "D" },
        { name: "David Redkey", party: "G" },
      ],
      war: 0,
    },
    "CA-04": {
      candidates: [
        { name: "Eric Jones", party: "D" },
        { name: "Mike Thompson", party: "D" },
      ],
      war: 0,
    },
    "CA-06": {
      candidates: [
        { name: "Kevin Kiley", party: "I" },
        { name: "Richard Pan", party: "D" },
      ],
      war: 0,
    },
    "CA-07": {
      candidates: [
        { name: "Doris Matsui", party: "D" },
        { name: "Mai Vang", party: "D" },
      ],
      war: 0,
    },
    "CA-11": {
      candidates: [
        { name: "Connie Chan", party: "D" },
        { name: "Scott Wiener", party: "D" },
      ],
      war: 0,
    },
    "CA-12": {
      candidates: [
        { name: "Jamie Joyce", party: "D" },
        { name: "Lateefah Simon", party: "D" },
      ],
      war: 0,
    },
    "CA-14": {
      candidates: [
        { name: "Melissa Hernandez", party: "D" },
        { name: "Aisha Wahab", party: "D" },
      ],
      war: 0,
    },
    "CA-29": {
      candidates: [
        { name: "Angelica Dueñas", party: "D" },
        { name: "Luz Rivas", party: "D" },
      ],
      war: 0,
    },
    "CA-34": {
      candidates: [
        { name: "Jimmy Gomez", party: "D" },
        { name: "Angela Gonzales-Torres", party: "D" },
      ],
      war: 0,
    },
    "CA-37": {
      candidates: [
        { name: "Sydney Kamlager-Dove", party: "D" },
        { name: "Samantha Mota", party: "D" },
      ],
      war: 0,
    },
    "CA-40": {
      candidates: [
        { name: "Ken Calvert", party: "R" },
        { name: "Young Kim", party: "R" },
      ],
      war: 0,
    },
    "FL-10": {
      candidates: [
        { name: "Maxwell Frost", party: "D" },
      ],
      war: 0,
    },
    "LA-04": {
      candidates: [
        { name: "Conrad Cable", party: "D" },
        { name: "Matt Gromlich", party: "D" },
        { name: "Mike Johnson", party: "R" },
      ],
      war: 0,
    },
    "MA-01": {
      candidates: [
        { name: "Nadia Milleron", party: "I" },
        { name: "Richard Neal", party: "D" },
      ],
      war: 0,
    },
    "MA-02": {
      candidates: [
        { name: "Jim McGovern", party: "D" },
      ],
      war: 0,
    },
    "MA-05": {
      candidates: [
        { name: "Katherine Clark", party: "D" },
      ],
      war: 0,
    },
    "MA-07": {
      candidates: [
        { name: "Ayanna Pressley", party: "D" },
      ],
      war: 0,
    },
    "NJ-08": {
      candidates: [
        { name: "Aristotle Eliopoulos", party: "I" },
        { name: "Rob Menendez", party: "D" },
      ],
      war: 0,
    },
    "PA-03": {
      candidates: [
        { name: "Dennis Mahoney", party: "I" },
        { name: "Chris Rabb", party: "D" },
      ],
      war: 0,
    },
    "WI-02": {
      candidates: [
        { name: "Mark Pocan", party: "D" },
      ],
      war: 0,
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

  function _fromRow(row) {
    if (!row) return { candidates: [], war: 0 };
    if (Array.isArray(row)) {
      const [dem, rep, war] = row;
      const candidates = [];
      if (dem) candidates.push({ name: String(dem), party: "D" });
      if (rep) candidates.push({ name: String(rep), party: "R" });
      return { candidates, war: _numOr(war, 0) };
    }
    if (Array.isArray(row.candidates)) {
      return {
        candidates: row.candidates.map((c) => ({
          name: String(c.name || ""),
          party: String(c.party || "O").toUpperCase(),
        })),
        war: _numOr(row.war, 0),
      };
    }
    const candidates = [];
    if (row.dem) candidates.push({ name: String(row.dem), party: "D" });
    if (row.rep) candidates.push({ name: String(row.rep), party: "R" });
    return { candidates, war: _numOr(row.war, 0) };
  }

  function _genericBallotMargin() {
    const avg = window.POLL_AVERAGE?.getAvg?.();
    if (avg != null && Number.isFinite(Number(avg))) {
      return 2 * Number(avg) - 100;
    }
    const b = window.HOUSE_2024_BASELINE;
    return b && Number.isFinite(b.nationalMargin) ? b.nationalMargin : 0;
  }

  /**
   * Non-cautious projection:
   *   2024 district margin + (generic ballot − 2024 national) + WAR
   */
  function computeProjectedMargin(id, opts) {
    id = _padId(id);
    const b = window.HOUSE_2024_BASELINE;
    if (!b?.marginById || b.marginById[id] === undefined) return null;
    const base = Number(b.marginById[id]);
    const war = opts && opts.war != null ? _numOr(opts.war, 0) : getDistrictWar(id);
    const national =
      opts && opts.nationalMargin != null && Number.isFinite(Number(opts.nationalMargin))
        ? Number(opts.nationalMargin)
        : _genericBallotMargin();
    const shift = national - b.nationalMargin;
    let projected = Math.max(-100, Math.min(100, base + shift + war));
    if (Math.abs(projected) < 0.05) projected = 0.1; // EVEN → D+0.1
    return projected;
  }

  function getDistrictWar(id) {
    id = _padId(id);
    if (!id) return 0;
    const { base, overrides } = _tablesFor(id);
    if (overrides[id]) return _numOr(overrides[id].war, 0);
    const row = base[id];
    if (!row) return 0;
    if (Array.isArray(row)) return _numOr(row[2], 0);
    return _numOr(row.war, 0);
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

  function getRace(id) {
    id = _padId(id);
    if (!id) {
      return { id: null, override: false, candidates: [], war: 0, margin: null };
    }
    const { base, overrides } = _tablesFor(id);
    if (overrides[id]) {
      const n = _fromRow(overrides[id]);
      return {
        id,
        override: true,
        candidates: n.candidates,
        war: n.war,
        margin: computeProjectedMargin(id, { war: n.war }),
      };
    }
    const n = _fromRow(base[id]);
    return {
      id,
      override: false,
      candidates: n.candidates,
      war: n.war,
      margin: computeProjectedMargin(id, { war: n.war }),
    };
  }

  function setDistrictRace(id, dem, rep, war) {
    id = _padId(id);
    const { base } = _tablesFor(id);
    base[id] = [
      dem == null || dem === "" ? null : String(dem),
      rep == null || rep === "" ? null : String(rep),
      _numOr(war, 0),
    ];
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
    overrides[id] = {
      candidates,
      war: _numOr(spec.war, 0),
    };
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
  window.setDistrictRace = setDistrictRace;
  window.overrideDistrictRace = overrideDistrictRace;
  window.clearDistrictRaceOverride = clearDistrictRaceOverride;
  window.computeProjectedMargin = computeProjectedMargin;
  window.formatRaceMargin = formatMargin;
  window.racePartyClass = partyClass;
  window.racePartyBadge = partyBadge;
})();
