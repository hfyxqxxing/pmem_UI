# Installation of Mellanox RNIC  

**All** the following steps should be executed on **two same servers**.
## Environment
**System:** Fedora 31  
**Kernel:** 5.3.7-301.fc31.x86_64  
**Hardware:** Mellanox Technologies MT28908 Family  ConnectX-6 200Gb  
**software:** MLNX_OFED_LINUX-5.1-2.5.8.0-fc31-x86_64.iso

## Hardware Setup

Go to https://docs.mellanox.com/display/ConnectX6EN/Hardware+Installation for more detailed installation instructions.  
* Shut down your servers' power.  
* Insert your RNIC cards into the slots on the Motherboard of the two computers.   
* Connect the two cards with the special cable. **Note**: the cable's plug is one side longer and one side shorter. Keep the longer side on the right and insert it into the RNIC slot. The slot position should also be the **same** on two servers.  
* Reboot your server.  

		$ lspci  | grep Mellanox
		 5e:00.0 Ethernet controller: Mellanox Technologies MT28908 Family [ConnectX-6]
		 5e:00.1 Ethernet controller: Mellanox Technologies MT28908 Family [ConnectX-6]

This result means your RNIC is successfully inserted.

***After** you install the driver successfully, you should check whether the cables are connected well. 

		$ idev2netdev
		mlnx5_0 port1 ==> ens2f0 (Up) 
		mlnx5_1 port1 ==> ens2f1 (Up) 
If the port is **...(Down)**, it means the cable is **not** connected correctly. You should try to adjust the cables. ***Restart*** the RNIC after each adjustment and check again.  

## Requirements
The mellanox driver should agree with your **operating system** version.

	$ cat etc/redhat-release
 
Go to https://www.mellanox.com/products/infiniband-drivers/linux/mlnx_ofed for the right version of driver.   

Install the required packages:  

	$ yum -y install gcc-gfortran tk tcl python2 tcsh perl chkconfig

Install the driver ( in the **same directory** with the .iso file ):  

	$ mkdir /mnt/mellanox/
	$ mount -o ro,loop MLNX_OFED_LINUX-5.1-2.5.8.0-fc31-x86_64.iso /mnt/mellanox/
	$ /mnt/mellanox/mlnxofedinstall --force

**Start** the driver:  

	$ /etc/init.d/openibd restart
	$ service openibd start
	$ chkconfig openibd on

**Note**: when executing the *- -force* step, the software will remind you of the lost packages. Follow its instructions to fix the problems. **If your kernel version is too high**, the driver may not support it and **fail the installation**  

## Virtual IP Address Setting  

Find your RNIC's name in your computer:  

	$ idev2netdev
	mlnx5_0 port1 ==> ens2f0 (Up) 
	mlnx5_1 port1 ==> ens2f1 (Up) 

**Note:** ***ens2f0** should be replaced by your own device name in the following steps  

	$ mlnx_qos -i ens2f0 --pfc 0,0,0,0,1,0,0,0
	$ modprobe 8021q
	$ vconfig add ens2f0 100
	$ ifconfig ens2f0.100 up
	$ ethtool -s ens2f0 speed 200000 autoneg off

**Set the virtual address:** Rpma needs one ***initiator*** server and one ***target*** server, all the steps above is shared except for the following one command:  
	
	$ ifconfig ens2f0.100 192.168.0.1
	# on initiator
	$ ifconfig ens2f0.100 192.168.0.2
	# on target

## Test the connection  

Use **rping** to check the connectivity:
	
	$ rping -s -a 192.168.0.2 -p 9999
	# on target
	$ rping -c -Vv -C5 -a 192.168.0.2 -p 9999
	# on initiator
If the rping finishes this test successfully, it means the RDMA connection is ***ready for use***.


### Additional Note:

If you are in **CentOS 7.0** or above centos systems, the ***vconfig*** is no longer available. You should find ***ip link*** commands to set the vitural address.
