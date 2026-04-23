import { virtual } from "@guidepup/virtual-screen-reader";

  describe("hello virtual SR", () => {
    it("announces a labelled input", async () => {
      document.body.innerHTML = `
  <label id="label1">Search for topics</label>
  <input type="text" aria-labelledby="label1" value="" placeholder="Search..."/>
  `;

  // Start the Virtual Screen Reader.
  await virtual.start({ container: document.body });

  // Move to the label element.
  await virtual.next();

  console.log(await virtual.lastSpokenPhrase());
  

  // Move to the input element.
  await virtual.next();

  // Expect on the spoken phrase for the input element.
  expect(await virtual.lastSpokenPhrase()).toEqual(
    "textbox, Search for topics, placeholder Search..."
  );

  console.log(await virtual.spokenPhraseLog());
  

  // Stop the Virtual Screen Reader.
  await virtual.stop();
    });
  });