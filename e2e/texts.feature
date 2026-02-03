Feature: Persist uploaded text offline
	As a user
	I want my uploaded text to be saved locally
	So that I can access my content even when offline

	Background:
		Given the application is loaded
		And I am offline

	Scenario Outline: Upload text <title>
		Given I add content <title> <content>
		When I navigate to '/texts'
		Then <title> appears in the list

		Examples:
			| title   | content                 |
			| 'hola'  | 'hola amigo como estas' |
			| 'adios' | 'adios mi amor'         |

	Scenario Outline: Read <title> text
		Given I add content <title> <content>
		When I navigate to '/texts'
		And I click <title>
		Then <content> is visible

		Examples:
			| title   | content                 |
			| 'hola'  | 'hola amigo como estas' |
			| 'adios' | "j'avais une bierre"    |

	Scenario Outline: Reading words saves them to known word list
		Given I add content <title> <content>
		When I navigate to '/texts'
		And I click <title>
		Then my known words is 0

		When I complete the text
		Then my known words is 4

		Examples:
			| title  | content                 |
			| 'hola' | 'hola amigo como estas' |

	Scenario: Clicking word saves it to difficult words
		Given I add content 'title' 'new content'
		When I navigate to '/texts'
		And I click 'title'
		Then my difficult words is 0
		When I click 'new'
		Then my difficult words is 1
		When I click 'content'
		Then my difficult words is 2
