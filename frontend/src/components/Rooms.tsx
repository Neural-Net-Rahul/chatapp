import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import axios from "axios";
import { INITIAL_URL } from "../constant";
import "../design/Rooms.css";
import { toast } from "react-toastify";
import image from '../../public/chatIcon.png';

const Rooms = () => {
  const { uId } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState("groups");
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [priv, setPrivate] = useState(false);

  useEffect(() => {
    const getRoomsData = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) {
          socket.disconnect();
          navigate("/");
        }
        const uData = await axios.post(`${INITIAL_URL}/api/users/getUserData`, {
          token,
          userId: Number(uId),
        });
        const aUData = await axios.get(`${INITIAL_URL}/api/users/getAllUsers`);
        const aGData = await axios.post(
          `${INITIAL_URL}/api/groups/getAllGroups`,
          { token, userId: Number(uId) }
        );
        setUserData(uData.data.user);
        setAllUsers(aUData.data.allUsers);
        setAllGroups(aGData.data.allGroups);
        setSelectedUsers((selectedUsers) => [...selectedUsers,Number(uId)])
        setLoading(false);
        if(!socket.connected){
            socket.connect();
        }
      } catch (e: any) {
        if (e.response.data.status === 505) {
          if(socket.connected){
            socket.disconnect();
          }
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/");
          }, 2000);
          return;
        }
        alert("Some error occurred");
        if (socket.connected) {
          socket.disconnect();
        }
        navigate("/");
      }
    };
    getRoomsData();
  }, []);

  useEffect(() => {
    socket.on("group_creation_error", (data) => {
      alert(data);
    });
    socket.on("join_group_error",(data)=>{
        alert(data);
    });
    socket.on("reject_group",(data)=>{
        alert(data);
    });
    return () => {
        socket.off('group_creation_error');
        socket.off("join_group_error");
        socket.off("reject_group");
    }
  },[])

  const handleCheckboxChange = (e: any, userId: any) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userId]);
    } else {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((id) => id !== userId)
      );
    }
    console.log("selected:", selectedUsers);
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rooms-container">
      <div className="sections">
        <button
          className={activeSection === "groups" ? "active" : ""}
          onClick={() => setActiveSection("groups")}
        >
          Groups
        </button>
        <button
          className={activeSection === "joiningRequests" ? "active" : ""}
          onClick={() => setActiveSection("joiningRequests")}
        >
          Joining Requests
        </button>
        <button
          className={activeSection === "users" ? "active" : ""}
          onClick={() => setActiveSection("users")}
        >
          Users
        </button>
        <button
          className={activeSection === "otherGroups" ? "active" : ""}
          onClick={() => setActiveSection("otherGroups")}
        >
          Other Groups
        </button>
      </div>

      {activeSection === "groups" && (
        <div className="section-content">
          <h2>Groups</h2>
          {userData.groupAndUser &&
            userData.groupAndUser.map((group: any) => {
                socket.emit('join_render',group.group.id);
                return(
              <div key={group.group.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={group.group.groupPic || image}
                      alt="Group Pic"
                      style={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                    <div style={{ marginLeft: 10 }}>
                      <h3 style={{ display: "inline-block" }}>
                        {group.group.name}
                      </h3>
                      <span
                        style={{ fontSize: 14, color: "gray", marginLeft: 10 }}
                      >
                        (Size: {group.group.groupSize})
                      </span>
                      <p>{group.group.description}</p>
                    </div>
                  </div>
                  <button
                    style={{
                      boxSizing: "border-box",
                      maxWidth: "200px",
                      marginBottom: "35px",
                    }}
                    onClick={() => {
                        navigate(`/chat/${group.group.id}`)
                    }}
                  >
                    Enter group
                  </button>
                </div>
              </div>
            )})}
        </div>
      )}

      {activeSection === "joiningRequests" && (
        <div className="section-content">
          <h2>Joining Requests</h2>
          {userData.groupJoiningReq
            .filter((gjr: any) => gjr.status === "PENDING")
            .map((gjr: any) => (
              <div key={gjr.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={gjr.group.groupPic || image}
                      alt="Group Pic"
                      style={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                    <div style={{ marginLeft: 10 }}>
                      <h3 style={{ display: "inline-block" }}>
                        {gjr.group.name}
                      </h3>
                      <span
                        style={{ fontSize: 14, color: "gray", marginLeft: 10 }}
                      >
                        (Size: {gjr.group.groupSize})
                      </span>
                      <p>{gjr.group.description}</p>
                    </div>
                  </div>
                  <button
                    style={{
                      boxSizing: "border-box",
                      maxWidth: "100px",
                      marginBottom: "35px",
                      marginRight: "20px",
                    }}
                    onClick={() => {
                      socket.emit("join_group", Number(uId), gjr.group.id);
                    }}
                  >
                    Yes
                  </button>
                  <button
                    style={{
                      boxSizing: "border-box",
                      maxWidth: "100px",
                      marginBottom: "35px",
                    }}
                    onClick={() => {
                      socket.emit("reject_group", Number(uId), gjr.group.id);
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeSection === "users" && (
        <div className="section-content">
          <button
            className=""
            onClick={() => {
              if (!name && !desc) {
                alert("Fill all fields");
                return;
              }
              toast.success("Processing...");
              socket.emit(
                "group_creation",
                selectedUsers,
                name,
                desc,
                Number(uId),
                priv
              );
              setName("");
              setDesc("");
            }}
          >
            Create Group
          </button>

          <div style={{ border: "2px solid black" }}>
            <div>
              <span>Name</span>{" "}
              <input
                type="text"
                value={name}
                style={{ border: "1px solid black", padding: "2px" }}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div>
              <span>Description</span>{" "}
              <input
                type="text"
                className="border"
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
                style={{ border: "1px solid black", padding: "2px" }}
              />
            </div>
            <div>
              <span>isPrivate</span>{" "}
              <input
                type="checkbox"
                checked={priv}
                onChange={(e) => setPrivate(e.target.checked)}
              />
            </div>
          </div>

          <h2>Users</h2>
          {allUsers &&
            allUsers.map((user: any) => {
              if (user.id === Number(uId)) {
                return;
              }
              return (
                <div key={user.id} className="flex items-center justify-center">
                  <img src={user.profilePic} className="profile-image" />
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    onChange={(e) => handleCheckboxChange(e, user.id)}
                  />
                </div>
              );
            })}
        </div>
      )}

      {activeSection === "otherGroups" && (
        <div className="section-content">
          <h2>Other Groups</h2>
          {allGroups &&
            allGroups.map((group: any) => (
              <div key={group.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={group.group.groupPic || image}
                      alt="Group Pic"
                      style={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                    <div style={{ marginLeft: 10 }}>
                      <h3 style={{ display: "inline-block" }}>
                        {group.group.name}
                      </h3>
                      <span
                        style={{ fontSize: 14, color: "gray", marginLeft: 10 }}
                      >
                        (Size: {group.group.groupSize})
                      </span>
                      <p>{group.group.description}</p>
                    </div>
                  </div>
                  <button
                    style={{
                      boxSizing: "border-box",
                      maxWidth: "200px",
                      marginBottom: "35px",
                    }}
                    onClick={() => {
                      socket.emit(
                        "join_other_group",
                        Number(uId),
                        group.group.id
                      );
                    }}
                  >
                    Join Group
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
